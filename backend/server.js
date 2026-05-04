const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const { User, Workout, DietPlan, WorkoutTemplate, DietLog } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middleware
// =======================

app.use(cors({
  origin: [
    "https://ygb-fitness-tracker.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

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

sequelize.authenticate()
  .then(async () => {
    console.log('✅ PostgreSQL connected');

    await sequelize.sync(); 

    console.log('✅ Database synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
