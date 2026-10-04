const jwt = require('jsonwebtoken');
const { signToken } = require('../../src/utils/token');

process.env.JWT_SECRET = 'unit-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

describe('signToken utility', () => {
  test('creates a JWT containing the user id and role', () => {
    const token = signToken({ _id: 'abc123', role: 'intern' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.role).toBe('intern');
  });
});
