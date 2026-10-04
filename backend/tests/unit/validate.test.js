const { validateTask, validateStatusQuery } = require('../../src/middleware/validate');

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('validateTask middleware', () => {
  test('accepts a valid task payload', () => {
    const req = { method: 'POST', body: { title: 'Build API', description: 'Write tests' } };
    const res = mockResponse();
    const next = jest.fn();
    validateTask(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects a POST without required title/description', () => {
    const req = { method: 'POST', body: { title: 'Only title' } };
    const res = mockResponse();
    const next = jest.fn();
    validateTask(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    ['status', 'Unknown', 'Invalid status'],
    ['priority', 'urgent', 'Invalid priority'],
    ['progress', 101, 'progress must be between 0 and 100'],
    ['estimatedHours', 169, 'estimatedHours must be between 0 and 168'],
    ['dueDate', 'not-a-date', 'dueDate must be a valid date']
  ])('rejects invalid %s', (field, value, message) => {
    const req = { method: 'PATCH', body: { [field]: value } };
    const res = mockResponse();
    const next = jest.fn();
    validateTask(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateStatusQuery middleware', () => {
  test('accepts an allowed status filter', () => {
    const req = { query: { status: 'Completed' } };
    const res = mockResponse();
    const next = jest.fn();
    validateStatusQuery(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('rejects an unknown status filter', () => {
    const req = { query: { status: 'Unknown' } };
    const res = mockResponse();
    const next = jest.fn();
    validateStatusQuery(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
