const { Op } = require('sequelize');
const { Workout, User } = require('../models');

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { name, exercises, duration, notes, mood, workoutType, date, isCompleted } = req.body;

    const workout = await Workout.create({
      userId: req.user.id,
      name: name || `Workout - ${new Date().toLocaleDateString('en-IN')}`,
      exercises: exercises || [],
      duration: duration || 0,
      notes,
      mood: mood || 'good',
      workoutType: workoutType || 'custom',
      date: date || new Date(),
      // Default to false (in progress) unless explicitly set to true
      isCompleted: isCompleted === true ? true : false
    });

    // Update streak only if explicitly completed
    if (workout.isCompleted) {
      await updateStreak(req.user.id);
    }

    res.status(201).json({ success: true, workout });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Error creating workout', error: error.message });
  }
};

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const { limit = 20, page = 1, type, includeIncomplete } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 50); // Hard cap at 50
    const parsedPage = parseInt(page);

    const where = { userId: req.user.id };
    if (type) where.workoutType = type;
    if (!includeIncomplete) where.isCompleted = true;

    const { count, rows } = await Workout.findAndCountAll({
      where,
      attributes: ['id', 'name', 'date', 'duration', 'workoutType', 'isCompleted', 'totalVolume'],
      order: [['date', 'DESC']],
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit
    });

    res.json({
      success: true,
      workouts: rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        pages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ 
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ success: true, workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Error fetching workout', error: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const wasCompleted = workout.isCompleted;
    await workout.update(req.body);

    // If workout was not completed but is now completed, update streak
    if (!wasCompleted && workout.isCompleted) {
      await updateStreak(req.user.id);
    }

    res.json({ success: true, workout });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Error updating workout', error: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const deleted = await Workout.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Error deleting workout', error: error.message });
  }
};

// @desc    Get workout stats / progress data
// @route   GET /api/workouts/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const workouts = await Workout.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.gte]: startDate },
        isCompleted: true
      },
      order: [['date', 'ASC']]
    });

    // Weekly consistency
    const totalDays = parseInt(days);
    const workoutDays = new Set(workouts.map(w => {
      try {
        return new Date(w.date).toDateString();
      } catch (e) {
        return null;
      }
    }).filter(d => d !== null)).size;
    const consistency = Math.round((workoutDays / totalDays) * 100);

    // Volume over time
    const volumeData = workouts.map(w => {
      try {
        return {
          date: new Date(w.date).toLocaleDateString('en-IN'),
          volume: w.totalVolume || 0,
          duration: w.duration || 0
        };
      } catch (e) {
        return null;
      }
    }).filter(d => d !== null);

    // Exercise PRs (personal records)
    const exercisePRs = {};
    workouts.forEach(workout => {
      (workout.exercises || []).forEach(exercise => {
        const weights = (exercise.sets || []).map(s => s.weight || 0);
        const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
        if (!exercisePRs[exercise.name] || maxWeight > exercisePRs[exercise.name]) {
          exercisePRs[exercise.name] = maxWeight;
        }
      });
    });

    // Workout frequency by type
    const typeFrequency = {};
    workouts.forEach(w => {
      if (w.workoutType) {
        typeFrequency[w.workoutType] = (typeFrequency[w.workoutType] || 0) + 1;
      }
    });

    // Strength progress for specific exercises
    const strengthProgress = {};
    workouts.forEach(workout => {
      (workout.exercises || []).forEach(exercise => {
        if (!exercise.name) return;
        if (!strengthProgress[exercise.name]) {
          strengthProgress[exercise.name] = [];
        }
        const weights = (exercise.sets || []).map(s => s.weight || 0);
        const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
        
        try {
          strengthProgress[exercise.name].push({
            date: new Date(workout.date).toLocaleDateString('en-IN'),
            weight: maxWeight,
            volume: (exercise.sets || []).reduce((acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
          });
        } catch (e) {
          // Skip invalid dates
        }
      });
    });

    res.json({
      success: true,
      stats: {
        totalWorkouts: workouts.length,
        consistency,
        volumeData,
        exercisePRs,
        typeFrequency,
        strengthProgress,
        totalVolume: workouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0),
        avgDuration: workouts.length > 0
          ? Math.round(workouts.reduce((acc, w) => acc + (w.duration || 0), 0) / workouts.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Helper: update streak
const updateStreak = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return;

  // First, check if the streak should have been reset due to inactivity
  await user.checkStreak();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.lastWorkoutDate) {
    const lastDate = new Date(user.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffInDays === 0) return; // Already worked out today
    if (diffInDays === 1) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1; // Reset streak
    }
  } else {
    user.currentStreak = 1;
  }

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  user.lastWorkoutDate = new Date();
  await user.save();
};

// @desc    Start a new workout from a template
// @route   POST /api/workouts/start-from-template/:templateId
// @access  Private
const startFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { date } = req.body;

    let template;
    
    // Check if it's a recommended template (ID starts with rec-)
    if (typeof templateId === 'string' && templateId.startsWith('rec-')) {
      const { RECOMMENDED_TEMPLATES } = require('./plansController');
      template = RECOMMENDED_TEMPLATES.find(t => t.id === templateId);
    } else {
      const WorkoutTemplate = require('../models/WorkoutTemplate');
      template = await WorkoutTemplate.findByPk(templateId);
    }

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Create workout from template
    const workout = await Workout.create({
      userId: req.user.id,
      name: template.name,
      exercises: (template.exercises || []).map(ex => {
        const numSets = parseInt(ex.defaultSets) || 3;
        const sets = Array.from({ length: numSets }, (_, i) => ({
          setNumber: i + 1,
          weight: 0,
          reps: parseInt(ex.defaultReps) || 10,
          type: 'normal',
          completed: false
        }));

        return {
          ...ex,
          sets
        };
      }),
      duration: 0,
      mood: 'good',
      workoutType: template.workoutType,
      date: date || new Date(),
      isCompleted: false,
      startTime: new Date()
    });

    // Increment template usage for DB templates
    if (template.update && template.usageCount !== undefined) {
      await template.update({ usageCount: (template.usageCount || 0) + 1 });
    }

    res.status(201).json({ success: true, workout });
  } catch (error) {
    console.error('Start from template error:', error);
    res.status(500).json({ message: 'Error starting workout from template', error: error.message });
  }
};

module.exports = { createWorkout, getWorkouts, getWorkout, updateWorkout, deleteWorkout, getStats, startFromTemplate };
