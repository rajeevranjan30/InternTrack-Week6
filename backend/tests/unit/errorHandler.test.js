const errorHandler = require('../../src/middleware/errorHandler');

function response() { return { status: jest.fn().mockReturnThis(), json: jest.fn() }; }

describe('errorHandler unit tests', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());
  test('maps Mongoose validation errors to HTTP 400', () => {
    const err = { name: 'ValidationError', errors: { title: { message: 'title is required' } } };
    const res = response();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Validation failed', errors: ['title is required'] });
  });

  test('maps duplicate-key errors to HTTP 409', () => {
    const res = response();
    errorHandler({ code: 11000 }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
