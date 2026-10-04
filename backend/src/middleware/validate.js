const statuses = ['Not started', 'In progress', 'Ready for review', 'Completed'];
const priorities = ['low', 'medium', 'high'];

exports.validateTask = (req, res, next) => {
  const b = req.body || {};
  if (req.method === 'POST') {
    if (!b.title || !b.description) return res.status(400).json({ success: false, message: 'title and description are required' });
  }
  if (b.title !== undefined && (typeof b.title !== 'string' || b.title.trim().length < 3)) return res.status(400).json({ success: false, message: 'title must contain at least 3 characters' });
  if (b.description !== undefined && (typeof b.description !== 'string' || b.description.trim().length < 3)) return res.status(400).json({ success: false, message: 'description must contain at least 3 characters' });
  if (b.status !== undefined && !statuses.includes(b.status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  if (b.priority !== undefined && !priorities.includes(b.priority)) return res.status(400).json({ success: false, message: 'Invalid priority' });
  if (b.progress !== undefined && (!Number.isFinite(Number(b.progress)) || Number(b.progress) < 0 || Number(b.progress) > 100)) return res.status(400).json({ success: false, message: 'progress must be between 0 and 100' });
  if (b.estimatedHours !== undefined && (!Number.isFinite(Number(b.estimatedHours)) || Number(b.estimatedHours) < 0 || Number(b.estimatedHours) > 168)) return res.status(400).json({ success: false, message: 'estimatedHours must be between 0 and 168' });
  if (b.dueDate !== undefined && b.dueDate !== '' && Number.isNaN(Date.parse(b.dueDate))) return res.status(400).json({ success: false, message: 'dueDate must be a valid date' });
  next();
};

exports.validateStatusQuery = (req, res, next) => {
  if (req.query.status && !statuses.includes(req.query.status)) return res.status(400).json({ success: false, message: 'Invalid status filter' });
  next();
};
