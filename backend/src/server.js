require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 8087;

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error('MONGODB_URI and JWT_SECRET must be set in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});