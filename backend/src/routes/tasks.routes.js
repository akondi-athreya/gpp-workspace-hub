const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth');

// Create task
router.post('/projects/:projectId/tasks', authenticate, tasksController.createTask);

// List tasks for a project
router.get('/projects/:projectId/tasks', authenticate, tasksController.listProjectTasks);

// Update task status
router.patch('/tasks/:taskId/status', authenticate, tasksController.updateTaskStatus);

// Update task fields
router.put('/tasks/:taskId', authenticate, tasksController.updateTask);

// Delete task
router.delete('/tasks/:taskId', authenticate, tasksController.deleteTask);

module.exports = router;
