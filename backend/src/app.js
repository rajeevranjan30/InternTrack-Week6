const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500,http://localhost:5500')
  .split(',').map(s => s.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'InternTrack API is running',
  timestamp: new Date().toISOString()
}));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
