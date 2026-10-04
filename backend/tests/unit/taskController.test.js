jest.mock('../../src/models/Task');

const mongoose = require('mongoose');
const Task = require('../../src/models/Task');
const controller = require('../../src/controllers/taskController');

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('taskController unit tests', () => {
  beforeEach(() => jest.clearAllMocks());

  test('create assigns the authenticated user as owner and filters unknown fields', async () => {
    Task.create.mockResolvedValue({ _id: 't1', title: 'Build API', owner: 'u1' });
    const req = { user: { id: 'u1' }, body: { title: 'Build API', description: 'Write tests', owner: 'attacker', hacked: true } };
    const res = response();
    await controller.create(req, res, jest.fn());
    expect(Task.create).toHaveBeenCalledWith({ title: 'Build API', description: 'Write tests', owner: 'u1' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('list scopes queries to the authenticated owner', async () => {
    const lean = jest.fn().mockResolvedValue([{ _id: 't1' }]);
    const sort = jest.fn().mockReturnValue({ lean });
    Task.find.mockReturnValue({ sort });
    const req = { user: { id: 'u1' }, query: {} };
    const res = response();
    await controller.list(req, res, jest.fn());
    expect(Task.find).toHaveBeenCalledWith({ owner: 'u1' });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
  });

  test('one rejects an invalid ObjectId before querying', async () => {
    const req = { user: { id: 'u1' }, params: { id: 'not-an-id' } };
    const res = response();
    await controller.one(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.findOne).not.toHaveBeenCalled();
  });

  test('update rejects an empty update body', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const req = { user: { id: 'u1' }, params: { id }, body: { hacked: true } };
    const res = response();
    await controller.update(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('remove returns 404 when the owner-scoped task does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    Task.findOneAndDelete.mockResolvedValue(null);
    const req = { user: { id: 'u1' }, params: { id } };
    const res = response();
    await controller.remove(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
