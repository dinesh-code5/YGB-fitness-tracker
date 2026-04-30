const express = require('express');
const router = express.Router();
const { calculateDiet, getDietPlan, logMeal, getTodaysLog, deleteLog } = require('../controllers/dietController');
const { generateAiDiet } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/calculate', calculateDiet);
router.post('/generate-ai', generateAiDiet);
router.get('/', getDietPlan);
router.post('/log', logMeal);
router.get('/logs/today', getTodaysLog);
router.delete('/logs/:id', deleteLog);

module.exports = router;
