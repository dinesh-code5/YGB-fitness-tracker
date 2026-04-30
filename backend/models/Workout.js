const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(200),
    defaultValue: () => `Workout - ${new Date().toLocaleDateString('en-IN')}`
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // JSONB: full exercise/set data — no need for separate tables
  // Structure: [{ exerciseId, name, muscleGroup, muscles[], sets[{ setNumber, weight, reps, type, completed }], restTime, ... }]
  exercises: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 }, // minutes
  totalVolume: { type: DataTypes.FLOAT, defaultValue: 0, field: 'total_volume' },
  totalSets: { type: DataTypes.INTEGER, defaultValue: 0, field: 'total_sets' },
  notes: { type: DataTypes.TEXT },
  mood: {
    type: DataTypes.ENUM('great', 'good', 'okay', 'bad'),
    defaultValue: 'good'
  },
  workoutType: {
    type: DataTypes.ENUM('push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'custom'),
    defaultValue: 'custom',
    field: 'workout_type'
  },
  startTime: { type: DataTypes.DATE, field: 'start_time' },
  endTime: { type: DataTypes.DATE, field: 'end_time' },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_completed' },
}, {
  tableName: 'workouts',
  underscored: true,
  hooks: {
    beforeSave: (workout) => {
      // Recalculate totals from exercises JSONB
      let totalVolume = 0, totalSets = 0;
      (workout.exercises || []).forEach(ex => {
        (ex.sets || []).forEach(set => {
          if (set.completed) {
            totalVolume += (set.weight || 0) * (set.reps || 0);
            totalSets++;
          }
        });
      });
      workout.totalVolume = totalVolume;
      workout.totalSets = totalSets;
    }
  }
});

module.exports = Workout;