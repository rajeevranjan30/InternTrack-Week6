const mongoose = require('mongoose');
const Task = require('../models/Task');

const allowedFields = ['title', 'description', 'category', 'status', 'priority', 'dueDate', 'estimatedHours', 'progress'];
const pickTaskFields = body => Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

const validateId = id => mongoose.Types.ObjectId.isValid(id);

exports.create = async (req, res, next) => {
  try {
    const data = pickTaskFields(req.body);
    const task = await Task.create({ ...data, owner: req.user.id });
    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = { owner: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 }).lean();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

exports.one = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task id' });
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task id' });
    const updates = pickTaskFields(req.body);
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'At least one editable field is required' });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task updated successfully', data: task });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task id' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully', data: { id: task._id } });
  } catch (err) { next(err); }
};
