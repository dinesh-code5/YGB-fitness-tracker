const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DietPlan = sequelize.define('DietPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // one active plan per user
    field: 'user_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  // Input params
  weight: DataTypes.FLOAT,
  height: DataTypes.FLOAT,
  age: DataTypes.INTEGER,
  gender: DataTypes.STRING(10),
  activityLevel: { type: DataTypes.STRING(20), field: 'activity_level' },
  goal: DataTypes.STRING(20),
  dietType: { type: DataTypes.STRING(20), defaultValue: 'veg', field: 'diet_type' },
  // Calculated
  bmr: DataTypes.INTEGER,
  tdee: DataTypes.INTEGER,
  targetCalories: { type: DataTypes.INTEGER, field: 'target_calories' },
  macros: { type: DataTypes.JSONB, defaultValue: {} },
  mealPlan: { type: DataTypes.JSONB, defaultValue: {}, field: 'meal_plan' },
  waterIntake: { type: DataTypes.FLOAT, field: 'water_intake' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'diet_plans',
  underscored: true,
});

module.exports = DietPlan;