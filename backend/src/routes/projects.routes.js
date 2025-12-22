const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/projects
 * Create project
 * Access: Authenticated users
 */
router.post('/', authenticate, projectsController.createProject);

/**
 * GET /api/projects
 * List projects
 * Access: Authenticated users (filtered by their tenant)
 */
router.get('/', authenticate, projectsController.listProjects);

/**
 * PUT /api/projects/:projectId
 * Update project
 * Access: tenant_admin or project creator
 */
router.put('/:projectId', authenticate, projectsController.updateProject);

/**
 * DELETE /api/projects/:projectId
 * Delete project
 * Access: tenant_admin or project creator
 */
router.delete('/:projectId', authenticate, projectsController.deleteProject);

module.exports = router;
