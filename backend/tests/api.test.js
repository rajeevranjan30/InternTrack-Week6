process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.FRONTEND_ORIGIN = 'http://127.0.0.1:5500';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

let mongo;
let token;
let user;
let taskId;

describe('InternTrack REST API', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    token = undefined;
    user = undefined;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  async function registerAndLogin(email = 'alex@example.com') {
    const register = await request(app).post('/api/auth/register').send({
      name: 'Alex Kumar', email, password: 'password123'
    });
    user = register.body.data.user;
    const login = await request(app).post('/api/auth/login').send({
      email, password: 'password123'
    });
    token = login.body.data.token;
  }

  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/register creates an intern and hashes the password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alex Kumar', email: 'alex@example.com', password: 'password123', role: 'admin'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('intern');
    const saved = await User.findOne({ email: 'alex@example.com' }).select('+password');
    expect(saved.password).not.toBe('password123');
  });

  test('POST /api/auth/register rejects duplicate email', async () => {
    await registerAndLogin();
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User', email: 'alex@example.com', password: 'password123'
    });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    await registerAndLogin();
    const res = await request(app).post('/api/auth/login').send({
      email: 'alex@example.com', password: 'wrong-password'
    });
    expect(res.status).toBe(401);
  });

  test('protected task routes reject missing authentication', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  test('task CRUD works for an authenticated user', async () => {
    await registerAndLogin();

    const create = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'Build API', description: 'Implement and test task CRUD.', category: 'Backend',
      priority: 'high', progress: 20
    });
    expect(create.status).toBe(201);
    taskId = create.body.data._id;

    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);

    const one = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(one.status).toBe(200);
    expect(one.body.data.title).toBe('Build API');

    const update = await request(app).patch(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`).send({
      status: 'Completed', progress: 100
    });
    expect(update.status).toBe(200);
    expect(update.body.data.progress).toBe(100);

    const filtered = await request(app).get('/api/tasks?status=Completed').set('Authorization', `Bearer ${token}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body.count).toBe(1);

    const del = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const missing = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(missing.status).toBe(404);
  });

  test('task validation rejects invalid progress and status', async () => {
    await registerAndLogin();
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'OK', description: 'Valid description', progress: 150, status: 'Unknown'
    });
    expect(res.status).toBe(400);
  });

  test('invalid task id returns 400', async () => {
    await registerAndLogin();
    const res = await request(app).get('/api/tasks/not-an-object-id').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('a user cannot read another user task', async () => {
    await registerAndLogin('first@example.com');
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'Private task', description: 'Only the owner should read this.'
    });
    const privateId = created.body.data._id;

    await registerAndLogin('second@example.com');
    const res = await request(app).get(`/api/tasks/${privateId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('unknown routes return JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
