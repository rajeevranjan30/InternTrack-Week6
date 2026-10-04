jest.mock('../../src/models/User');
jest.mock('../../src/utils/token', () => ({ signToken: jest.fn(() => 'mock-token') }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(() => Promise.resolve('hashed-password')), compare: jest.fn() }));

const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const { signToken } = require('../../src/utils/token');
const { register, login } = require('../../src/controllers/authController');

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('authController unit tests', () => {
  beforeEach(() => jest.clearAllMocks());

  test('registers an intern and never trusts a client-supplied role', async () => {
    User.exists.mockResolvedValue(false);
    User.create.mockResolvedValue({ _id: 'u1', name: 'Alex', email: 'alex@example.com', role: 'intern' });
    const req = { body: { name: ' Alex ', email: ' ALEX@example.com ', password: 'password123', role: 'admin' } };
    const res = response();
    await register(req, res, jest.fn());
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Alex', email: 'alex@example.com', password: 'hashed-password', role: 'intern'
    }));
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    expect(signToken).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });


  test('rejects non-string registration fields instead of throwing a server error', async () => {
    const req = { body: { name: 123, email: 'alex@example.com', password: 'password123' } };
    const res = response();
    const next = jest.fn();
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
    expect(User.exists).not.toHaveBeenCalled();
  });

  test('rejects a short password', async () => {
    const req = { body: { name: 'Alex', email: 'alex@example.com', password: 'short' } };
    const res = response();
    await register(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.exists).not.toHaveBeenCalled();
  });

  test('rejects duplicate email', async () => {
    User.exists.mockResolvedValue(true);
    const req = { body: { name: 'Alex', email: 'alex@example.com', password: 'password123' } };
    const res = response();
    await register(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('login rejects invalid credentials', async () => {
    const select = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select });
    const req = { body: { email: 'alex@example.com', password: 'wrong' } };
    const res = response();
    await login(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
