const express = require('express');
const router = express.Router();
const { createWorkout, getWorkouts, getWorkout, updateWorkout, deleteWorkout, getStats, startFromTemplate } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.post('/start-from-template/:templateId', startFromTemplate);
router.route('/').get(getWorkouts).post(createWorkout);
router.route('/:id').get(getWorkout).put(updateWorkout).delete(deleteWorkout);

module.exports = router;
