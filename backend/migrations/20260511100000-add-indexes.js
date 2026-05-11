'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Workout history/queries
    await queryInterface.addIndex('Workouts', ['userId', 'date', 'isCompleted']);
    await queryInterface.addIndex('Workouts', ['workoutType']);
    
    // Diet logs
    await queryInterface.addIndex('DietLogs', ['userId', 'date']);
    
    // User profile/search
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('Users', ['isPublic']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Workouts', ['userId', 'date', 'isCompleted']);
    await queryInterface.removeIndex('Workouts', ['workoutType']);
    await queryInterface.removeIndex('DietLogs', ['userId', 'date']);
    await queryInterface.removeIndex('Users', ['username']);
    await queryInterface.removeIndex('Users', ['isPublic']);
  }
};