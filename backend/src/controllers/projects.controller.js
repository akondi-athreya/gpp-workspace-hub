const projectsModel = require('../models/projects.model');
const { success, error } = require('../utils/responses');

/**
 * POST /api/projects
 * Create project
 * Authorization: Authenticated users
 */
const createProject = async (req, res, next) => {
  try {
    const requestingUser = req.user;
    const { name, description, status } = req.body;

    // Validate required fields
    if (!name) {
      return error(res, 'Project name is required', 400);
    }

    // Validate name type
    if (typeof name !== 'string' || name.trim().length === 0) {
      return error(res, 'Project name must be a non-empty string', 400);
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['active', 'archived', 'completed'];
      if (!validStatuses.includes(status)) {
        return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    const projectData = {
      name,
      description,
      status,
    };

    const project = await projectsModel.createProject(projectData, requestingUser);

    return success(res, project, 'Project created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/projects
 * List projects
 * Authorization: Authenticated users (filtered by their tenant)
 */
const listProjects = async (req, res, next) => {
  try {
    const requestingUser = req.user;
    const { status, search, page, limit } = req.query;

    // Validate query parameters
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return error(res, 'Page must be a positive integer', 400);
      }
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return error(res, 'Limit must be between 1 and 100', 400);
      }
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'archived', 'completed'];
      if (!validStatuses.includes(status)) {
        return error(res, `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    const result = await projectsModel.listProjects(requestingUser, {
      status,
      search,
      page,
      limit,
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/projects/:projectId
 * Update project
 * Authorization: tenant_admin OR project creator
 */
const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requestingUser = req.user;
    const updates = req.body;

    // Validate projectId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      return error(res, 'Invalid project ID format', 400);
    }

    // Validate that request body is not empty
    if (!updates || Object.keys(updates).length === 0) {
      return error(res, 'No update fields provided', 400);
    }

    // Validate field types
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return error(res, 'Project name must be a non-empty string', 400);
      }
    }

    if (updates.status !== undefined) {
      const validStatuses = ['active', 'archived', 'completed'];
      if (!validStatuses.includes(updates.status)) {
        return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    const updatedProject = await projectsModel.updateProject(projectId, updates, requestingUser);

    return success(res, updatedProject, 'Project updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/projects/:projectId
 * Delete project
 * Authorization: tenant_admin OR project creator
 */
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requestingUser = req.user;

    // Validate projectId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      return error(res, 'Invalid project ID format', 400);
    }

    await projectsModel.deleteProject(projectId, requestingUser);

    return success(res, null, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
};
