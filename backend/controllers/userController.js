const { Op } = require('sequelize');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { 
      name, age, weight, height, gender, goal, 
      experience, activityLevel, notifications,
      weightUnit, heightUnit, restTimerDuration, bio,
      archetype
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (age) user.age = age;
    if (height) user.height = height;
    if (gender) user.gender = gender;
    if (goal) user.goal = goal;
    if (experience) user.experience = experience;
    if (activityLevel) user.activityLevel = activityLevel;
    if (bio !== undefined) user.bio = bio;
    if (weightUnit) user.weightUnit = weightUnit;
    if (heightUnit) user.heightUnit = heightUnit;
    if (restTimerDuration) user.restTimerDuration = restTimerDuration;
    if (notifications) user.notifications = { ...user.notifications, ...notifications };
    if (archetype) user.archetype = archetype;

    // Track weight history if weight changed
    if (weight && weight !== user.weight) {
      user.weight = weight;
      const history = [...(user.weightHistory || [])];
      history.push({ weight, date: new Date().toISOString() });
      // Keep last 90 entries
      user.weightHistory = history.length > 90 ? history.slice(-90) : history;
      user.changed('weightHistory', true);
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc    Update password
// @route   PUT /api/user/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
};

// @desc    Get weight history
// @route   GET /api/user/weight-history
// @access  Private
const getWeightHistory = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['weightHistory', 'weight']
    });
    res.json({ success: true, weightHistory: user.weightHistory, currentWeight: user.weight });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weight history' });
  }
};

// @desc    Log weight
// @route   POST /api/user/weight
// @access  Private
const logWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    console.log(`[BACKEND] Logging weight for user ${req.user.id}: ${weight}kg`);
    if (!weight) return res.status(400).json({ message: 'Weight is required' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.weight = weight;
    
    // Explicitly create a new array to ensure Sequelize detects the change
    const history = [...(user.weightHistory || [])];
    history.push({ 
      weight: parseFloat(weight), 
      date: new Date().toISOString() 
    });
    
    // Keep last 90 entries
    user.weightHistory = history.length > 90 ? history.slice(-90) : history;
    user.changed('weightHistory', true);
    
    await user.save();
    console.log(`[BACKEND] Weight saved successfully for user ${req.user.id}`);

    res.json({ success: true, message: 'Weight logged', weight, weightHistory: user.weightHistory });
  } catch (error) {
    console.error('[BACKEND] Error logging weight:', error);
    res.status(500).json({ message: 'Error logging weight' });
  }
};


// @desc    Search users by username
// @route   GET /api/user/search?q=username
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ message: 'Search query too short' });
    
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { name: { [Op.iLike]: `%${q}%` } }
        ],
        id: { [Op.ne]: req.user.id },
        isPublic: true
      },
      attributes: ['id', 'name', 'username', 'avatar', 'weight', 'height', 'goal', 'experience', 'currentStreak', 'isPublic'],
      limit: 20
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search error' });
  }
};

// @desc    Get public user profile by username
// @route   GET /api/user/u/:username
// @access  Private
const getPublicProfile = async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id', 'name', 'username', 'avatar', 'bio', 'goal', 'experience', 'currentStreak', 'longestStreak', 'weightHistory', 'progressPhotos', 'isPublic', 'createdAt']
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isPublic && (!req.user || user.id !== req.user.id)) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    // Get recent workouts
    const workouts = await Workout.findAll({
      where: { userId: user.id, isCompleted: true },
      limit: 10,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'name', 'workoutType', 'duration', 'createdAt', 'mood'],
      raw: true
    });

    res.json({ 
      success: true, 
      user: {
        ...user.toJSON(),
        workoutHistory: workouts,
        progressPhotos: user.progressPhotos || [],
        totalWorkouts: workouts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// @desc    Add progress photo
// @route   POST /api/user/progress-photo
// @access  Private
const addProgressPhoto = async (req, res) => {
  try {
    const { weight, note, imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });
    
    const user = await User.findByPk(req.user.id);
    const newPhotos = [...(user.progressPhotos || [])];
    
    const crypto = require('crypto');
    newPhotos.push({ 
      id: crypto.randomUUID(),
      weight: Number(weight) || user.weight, 
      note, 
      imageUrl, 
      date: new Date().toISOString() 
    });

    // Keep last 50 entries
    const finalPhotos = newPhotos.length > 50 ? newPhotos.slice(-50) : newPhotos;
    
    user.progressPhotos = finalPhotos;
    await user.save();
    
    res.json({ success: true, progressPhotos: user.progressPhotos });
  } catch (error) {
    console.error('Add progress photo error:', error);
    res.status(500).json({ message: 'Error saving photo' });
  }
};

// @desc    Get progress photos
// @route   GET /api/user/progress-photos
// @access  Private
const getProgressPhotos = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['progressPhotos']
    });
    res.json({ success: true, progressPhotos: user.progressPhotos || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

// @desc    Toggle profile privacy
// @route   PUT /api/user/privacy
// @access  Private
const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    user.isPublic = !user.isPublic;
    await user.save();
    res.json({ success: true, isPublic: user.isPublic });
  } catch (error) {
    res.status(500).json({ message: 'Error updating privacy' });
  }
};

// @desc    Delete progress photo
// @route   DELETE /api/user/progress-photo/:id
// @access  Private
const deleteProgressPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(req.user.id);
    
    if (!user.progressPhotos) return res.json({ success: true, progressPhotos: [] });

    // Filter by ID (UUID string) or index (if someone passed an index)
    const newPhotos = user.progressPhotos.filter((p, i) => {
      if (p.id === id) return false;
      if (String(i) === id) return false;
      return true;
    });

    user.progressPhotos = newPhotos;
    await user.save();
    
    res.json({ success: true, progressPhotos: user.progressPhotos });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Error deleting photo' });
  }
};

// @desc    Verify Promo Code
// @route   POST /api/user/verify-promo
// @access  Private
const verifyPromo = async (req, res) => {
  try {
    const { code } = req.body;
    const VALID_CODES = ['YGBFREE', 'PROMO100', 'FITNESS2024'];
    
    if (VALID_CODES.includes(code.toUpperCase())) {
      const user = await User.findByPk(req.user.id);
      user.isPremium = true;
      user.promoCode = code.toUpperCase();
      await user.save();
      return res.json({ success: true, message: 'Premium Unlocked! 🎉', user });
    }
    
    res.status(400).json({ message: 'Invalid promo code' });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};

module.exports = { getProfile, updateProfile, updatePassword, getWeightHistory, logWeight, searchUsers, getPublicProfile, addProgressPhoto, getProgressPhotos, togglePrivacy, deleteProgressPhoto, verifyPromo };
