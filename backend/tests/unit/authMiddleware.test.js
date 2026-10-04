const jwt = require('jsonwebtoken');
const auth = require('../../src/middleware/auth');

process.env.JWT_SECRET = 'unit-test-secret';

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('auth middleware', () => {
  test('rejects a missing Authorization header', () => {
    const req = { headers: {} };
    const res = response();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = response();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid Bearer token and attaches the user', () => {
    const payload = { id: 'user-123', role: 'intern' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = jest.fn();
    auth(req, res, next);
    expect(req.user.id).toBe('user-123');
    expect(req.user.role).toBe('intern');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
