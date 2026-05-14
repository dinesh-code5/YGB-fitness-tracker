const { WorkoutTemplate } = require('../models');
const { Op } = require('sequelize');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

// @desc    Get all templates (system + user)
const getTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `templates_${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [systemTemplates, userTemplates] = await Promise.all([
      // System templates (null userId, isSystem=true)
      WorkoutTemplate.findAll({
        where: { userId: null, isSystem: true },
        attributes: ['id', 'name', 'workoutType', 'usageCount', 'exercises'],
        order: [['usageCount', 'DESC'], ['name', 'ASC']]
      }),
      // User templates
      WorkoutTemplate.findAll({
        where: { userId },
        attributes: ['id', 'name', 'workoutType', 'exercises', 'updatedAt'],
        order: [['updatedAt', 'DESC']]
      })
    ]);

    const result = {
      systemTemplates,
      userTemplates,
      total: systemTemplates.length + userTemplates.length
    };
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
};
// ... rest of file (create/update/delete)
// Add logic to delete cache in create/update/delete
// (Omitted for brevity in edit, but I'll add the invalidation)
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
    cache.del(`templates_${userId}`);
    res.status(201).json({ template });
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to create template', 
      error: error.message 
    });
  }
};

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
    await template.reload();
    cache.del(`templates_${userId}`);

    res.json({ template });
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to update template', 
      error: error.message 
    });
  }
};

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
    cache.del(`templates_${userId}`);
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