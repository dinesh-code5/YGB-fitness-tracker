const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const posthog = require('../config/posthog');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    let { 
      name, email, password, age, weight, height, gender, 
      goal, experience, activityLevel, username,
      weightUnit, heightUnit, referralCode, archetype
    } = req.body;

    // Clean inputs
    if (email) email = email.toLowerCase().trim();
    if (username) username = username.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check username uniqueness
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Promo code / Referral code logic
    const VALID_PROMOS = ['YGBFREE', 'PROMO100', 'FITNESS2024'];
    const isPremium = referralCode && referralCode.trim() && VALID_PROMOS.includes(referralCode.trim().toUpperCase());

    // Create user
    const user = await User.create({
      name, 
      email, 
      password,
      username: username || null,
      age, 
      weight, 
      height, 
      gender,
      goal: goal || 'maintain',
      experience: experience || 'beginner',
      activityLevel: activityLevel || 'moderate',
      weightUnit: weightUnit || 'kg',
      heightUnit: heightUnit || 'cm',
      weightHistory: weight ? [{ weight, date: new Date().toISOString() }] : [],
      referralCode: referralCode || null,
      promoCode: isPremium ? referralCode.trim().toUpperCase() : null,
      isPremium: !!isPremium,
      archetype: archetype || 'fit'
    });

    const token = generateToken(user.id);

    posthog.identify({
      distinctId: String(user.id),
      properties: {
        email: user.email,
        name: user.name,
        goal: user.goal,
        experience: user.experience,
        isPremium: user.isPremium,
        archetype: user.archetype,
      },
    });
    posthog.capture({
      distinctId: String(user.id),
      event: 'user_registered',
      properties: {
        goal: user.goal,
        experience: user.experience,
        activityLevel: user.activityLevel,
        gender: user.gender,
        isPremium: user.isPremium,
        archetype: user.archetype,
        hasReferralCode: !!referralCode,
      },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        experience: user.experience,
        activityLevel: user.activityLevel,
        currentStreak: user.currentStreak,
        restTimerDuration: user.restTimerDuration,
        weightUnit: user.weightUnit,
        heightUnit: user.heightUnit,
        isPremium: user.isPremium,
        archetype: user.archetype,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginId = identifier || email || username;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Find user by email or username
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { email: loginId.toLowerCase().trim() },
          { username: loginId.toLowerCase().trim() }
        ]
      },
      attributes: { include: ['password'] }
    });
    
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found for ${loginId}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Incorrect password for ${user.email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // Check and reset streak if needed
    await user.checkStreak();

    posthog.capture({
      distinctId: String(user.id),
      event: 'user_logged_in',
      properties: {
        currentStreak: user.currentStreak,
        isPremium: user.isPremium,
        archetype: user.archetype,
      },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        experience: user.experience,
        activityLevel: user.activityLevel,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        restTimerDuration: user.restTimerDuration,
        isPremium: user.isPremium,
        archetype: user.archetype,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      await user.checkStreak();
    }
    res.json({ success: true, user: user.toSafeObject ? user.toSafeObject() : user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

module.exports = { register, login, getMe };
