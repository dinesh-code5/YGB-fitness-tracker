const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { len: [1, 50] }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(val) { this.setDataValue('email', val.toLowerCase()); }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true,
    validate: { is: /^[a-z0-9_.]{3,20}$/ },
    set(val) { if (val) this.setDataValue('username', val.toLowerCase()); }
  },
  avatar: { type: DataTypes.TEXT, defaultValue: '' },
  bio: { type: DataTypes.STRING(200) },
  // Physical stats
  age: { type: DataTypes.INTEGER, validate: { min: 10, max: 100 } },
  weight: { type: DataTypes.FLOAT },
  height: { type: DataTypes.FLOAT },
  gender: { type: DataTypes.ENUM('male', 'female', 'other') },
  // Fitness profile
  goal: {
    type: DataTypes.ENUM('cut', 'bulk', 'maintain'),
    defaultValue: 'maintain'
  },
  experience: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    defaultValue: 'moderate',
    field: 'activity_level'
  },
  // Streaks
  currentStreak: { type: DataTypes.INTEGER, defaultValue: 0, field: 'current_streak' },
  longestStreak: { type: DataTypes.INTEGER, defaultValue: 0, field: 'longest_streak' },
  lastWorkoutDate: { type: DataTypes.DATE, field: 'last_workout_date' },
  // JSONB arrays — stored as JSON in PostgreSQL
  weightHistory: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'weight_history'
  },
  progressPhotos: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'progress_photos'
  },
  // Social
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_public' },
  isCoach: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_coach' },
  referralCode: { type: DataTypes.STRING(20), field: 'referral_code' },
  // Notifications (JSONB)
  notifications: {
    type: DataTypes.JSONB,
    defaultValue: { workoutReminder: true, reminderTime: '08:00' }
  },
  // Customization
  restTimerDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
    field: 'rest_timer_duration'
  },
  weightUnit: {
    type: DataTypes.ENUM('kg', 'lbs'),
    defaultValue: 'kg',
    field: 'weight_unit'
  },
  heightUnit: {
    type: DataTypes.ENUM('cm', 'ft'),
    defaultValue: 'cm',
    field: 'height_unit'
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  promoCode: {
    type: DataTypes.STRING,
    field: 'promo_code'
  }
}, {
  tableName: 'users',
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance method
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe output — omit password
User.prototype.toSafeObject = function() {
  const { password, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;