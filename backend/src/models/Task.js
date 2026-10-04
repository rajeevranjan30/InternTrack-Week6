const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 3, maxlength: 2000 },
  category: { type: String, trim: true, maxlength: 60, default: 'General' },
  status: { type: String, enum: ['Not started', 'In progress', 'Ready for review', 'Completed'], default: 'Not started' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  estimatedHours: { type: Number, min: 0, max: 168 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true }
}, { timestamps: true });

taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
