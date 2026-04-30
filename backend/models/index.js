const sequelize = require('../config/database');
const User = require('./User');
const Workout = require('./Workout');
const DietPlan = require('./DietPlan');
const WorkoutTemplate = require('./WorkoutTemplate');
const DietLog = require('./DietLog');

// Associations
User.hasMany(Workout, { foreignKey: 'userId', as: 'workouts', onDelete: 'CASCADE' });
Workout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(DietPlan, { foreignKey: 'userId', as: 'dietPlan', onDelete: 'CASCADE' });
DietPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(WorkoutTemplate, { foreignKey: 'userId', as: 'templates', onDelete: 'CASCADE' });
WorkoutTemplate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietLog, { foreignKey: 'userId', as: 'dietLogs', onDelete: 'CASCADE' });
DietLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Workout, DietPlan, WorkoutTemplate, DietLog };