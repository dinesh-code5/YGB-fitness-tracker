const express = require('express');
const router = express.Router();
const { getWorkoutPlan, getExercises, getExercise, getMuscleGroups } = require('../controllers/plansController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/workout', getWorkoutPlan);
router.get('/muscle-groups', getMuscleGroups);
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExercise);

module.exports = router;
