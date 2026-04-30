const express = require('express');
const router = express.Router();
const { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} = require('../controllers/templateController.js');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .put(updateTemplate)
  .delete(deleteTemplate);

module.exports = router;