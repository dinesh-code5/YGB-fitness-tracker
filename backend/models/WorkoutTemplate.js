const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutTemplate = sequelize.define('WorkoutTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null = system template
    field: 'user_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: DataTypes.TEXT,
  workoutType: {
    type: DataTypes.ENUM('push','pull','legs','upper','lower','full_body','cardio','custom'),
    defaultValue: 'custom',
    field: 'workout_type'
  },
  targetMuscles: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [], field: 'target_muscles' },
  exercises: { type: DataTypes.JSONB, defaultValue: [] },
  estimatedDuration: { type: DataTypes.INTEGER, defaultValue: 60, field: 'estimated_duration' },
  difficulty: {
    type: DataTypes.ENUM('beginner','intermediate','advanced'),
    defaultValue: 'beginner'
  },
  goal: {
    type: DataTypes.ENUM('cut','bulk','maintain','general'),
    defaultValue: 'general'
  },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_system' },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_public' },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'usage_count' },
}, {
  tableName: 'workout_templates',
  underscored: true,
});

module.exports = WorkoutTemplate;