const WorkoutTemplate = require('../models/WorkoutTemplate');
const { Op } = require('sequelize');

// @desc    Get all templates (system + user)
const getTemplates = async (req, res) => {
  try {
    const userId = req.user.id;

    const [systemTemplates, userTemplates] = await Promise.all([
      // System templates (null userId, isSystem=true)
      WorkoutTemplate.findAll({
        where: { userId: null, isSystem: true },
        order: [['usageCount', 'DESC'], ['name', 'ASC']]
      }),
      // User templates
      WorkoutTemplate.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']]
      })
    ]);

    res.json({
      systemTemplates,
      userTemplates,
      total: systemTemplates.length + userTemplates.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
};

// @desc    Create new template
const createTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const templateData = {
      ...req.body,
      userId,
      isSystem: false,
      targetMuscles: req.body.targetMuscles || []
    };

    const template = await WorkoutTemplate.create(templateData);
    res.status(201).json({ template });
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to create template', 
      error: error.message 
    });
  }
};

// @desc    Update template
const updateTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const template = await WorkoutTemplate.findOne({
      where: { id, userId }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.update(req.body);
    await template.reload(); // Refresh with associations

    res.json({ template });
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to update template', 
      error: error.message 
    });
  }
};

// @desc    Delete template
const deleteTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const template = await WorkoutTemplate.findOne({
      where: { id, userId }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.destroy();
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete template', 
      error: error.message 
    });
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
};