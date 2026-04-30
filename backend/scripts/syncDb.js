require('dotenv').config();
const sequelize = require('../config/database');
const { User, Workout, DietPlan, WorkoutTemplate } = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Starting database sync...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection successful');

    // Sync all models (alter: true allows safe schema changes)
    // Use force: true ONLY for development/testing (deletes all data)
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized');

    console.log('\n📊 Tables created/updated:');
    console.log('  - users');
    console.log('  - workouts');
    console.log('  - diet_plans');
    console.log('  - workout_templates');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    process.exit(1);
  }
};

syncDatabase();
