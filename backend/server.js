const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const { User, Workout, DietPlan, WorkoutTemplate, DietLog } = require('./models');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middleware
// =======================

app.use(cors({
  origin: [
    "https://ygb-fitness-tracker.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '********';
    console.log('Body:', safeBody);
  }
  next();
});

// =======================
// Routes (CSRF logic removed)
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/templates', require('./routes/templates'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// =======================
// Database + Server Start
// =======================

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}

sequelize.authenticate()
  .then(async () => {
    console.log('✅ PostgreSQL connected');

    await sequelize.sync(); 

    console.log('✅ Database synced');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
    });
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
