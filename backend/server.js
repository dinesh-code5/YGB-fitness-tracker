// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const cookieParser = require('cookie-parser');
// // const csrf = require('csurf');
// const sequelize = require('./config/database');
// const { User, Workout, DietPlan, WorkoutTemplate, DietLog } = require('./models');

// dotenv.config();

// const app = express();

// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || true, // true reflects the request origin
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
//   exposedHeaders: ['X-CSRF-Token']
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(cookieParser(process.env.COOKIE_SECRET || 'ygb-gym-buddy-secret'));

// // CSRF Protection
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax'
//   }
// });
// // Routes
// app.get('/api/csrf-token', csrfProtection, (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

// app.use('/api/auth', csrfProtection, require('./routes/auth'));
// app.use('/api/user', csrfProtection, require('./routes/user'));
// app.use('/api/workouts', csrfProtection, require('./routes/workouts'));
// app.use('/api/diet', csrfProtection, require('./routes/diet'));
// app.use('/api/plans', csrfProtection, require('./routes/plans'));
// app.use('/api/templates', csrfProtection, require('./routes/templates'));
// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'YGB API Running 💪', timestamp: new Date() });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   if (err.code === 'EBADCSRFTOKEN') {
//     console.warn('❌ CSRF Token Error:', req.method, req.url);
//     return res.status(403).json({
//       message: 'Form security expired. Please refresh the page.'
//     });
//   }
  
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // Sync database and start server
// sequelize.authenticate()
//   .then(async () => {
//     console.log('✅ PostgreSQL connected');
//     // Sync all models (use { alter: true } for production-safe changes)
//     await sequelize.sync({ alter: true });
//     console.log('✅ Database synced');
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch(err => {
//     console.error('❌ PostgreSQL connection error:', err.message);
//     process.exit(1);
//   });

// module.exports = app;

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
  origin: "https://ygb-fitness-tracker.netlify.app" // your frontend URL
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'ygb-gym-buddy-secret'));


app.get("/", (req, res) => {
  res.send("YGB API running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'YGB API Running 💪', timestamp: new Date() });
});

// API routes (NO CSRF)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/templates', require('./routes/templates'));


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

    await sequelize.sync(); // safer for deployment

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
