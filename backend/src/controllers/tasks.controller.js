const tasksModel = require('../models/tasks.model');
const { success, error } = require('../utils/responses');
const { logAudit } = require('../utils/audit');

/**
 * POST /api/projects/:projectId/tasks
 * Create task
 * Authorization: Authenticated users; project must belong to user's tenant
 */
const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const requestingUser = req.user;
        const { title, description, assignedTo, priority, dueDate } = req.body;

        // Validate projectId format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(projectId)) {
            return error(res, 'Invalid project ID format', 400);
        }

        // Validate required fields
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return error(res, 'title is required and must be a non-empty string', 400);
        }

        // Validate priority
        if (priority !== undefined) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return error(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
            }
        }

        // Validate assignedTo if provided
        if (assignedTo !== undefined && assignedTo !== null) {
            if (!uuidRegex.test(assignedTo)) {
                return error(res, 'Invalid assignedTo user ID format', 400);
            }
        }

        // Validate dueDate if provided
        let parsedDueDate = null;
        if (dueDate !== undefined && dueDate !== null) {
            const d = new Date(dueDate);
            if (isNaN(d.getTime())) {
                return error(res, 'Invalid dueDate', 400);
            }
            parsedDueDate = d;
        }

        const taskData = {
            title,
            description,
            assignedTo: assignedTo || null,
            priority: priority || 'medium',
            dueDate: parsedDueDate,
        };

        const task = await tasksModel.createTask(projectId, taskData, requestingUser);

        await logAudit({
            tenantId: task.tenantId,
            userId: requestingUser.userId,
            action: 'CREATE_TASK',
            entityType: 'task',
            entityId: task.id,
            ipAddress: req.ip,
        });

        return success(res, task, 'Task created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/projects/:projectId/tasks
 * List tasks for a project
 * Authorization: Project must belong to user's tenant
 */
const listProjectTasks = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const requestingUser = req.user;
        const { status, assignedTo, priority, search, page, limit } = req.query;

        // Validate projectId format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(projectId)) {
            return error(res, 'Invalid project ID format', 400);
        }

        // Validate query params
        if (status !== undefined) {
            const validStatuses = ['todo', 'in_progress', 'completed'];
            if (!validStatuses.includes(status)) {
                return error(res, `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`, 400);
            }
        }

        if (priority !== undefined) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return error(res, `Invalid priority filter. Must be one of: ${validPriorities.join(', ')}`, 400);
            }
        }

        if (assignedTo !== undefined) {
            if (!uuidRegex.test(assignedTo)) {
                return error(res, 'Invalid assignedTo user ID filter format', 400);
            }
        }

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

        const result = await tasksModel.listProjectTasks(projectId, requestingUser, {
            status,
            assignedTo,
            priority,
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
 * PATCH /api/tasks/:taskId/status
 * Update task status
 * Authorization: Any user in tenant; task must belong to user's tenant
 */
const updateTaskStatus = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;
        const { status } = req.body;

        // Validate taskId format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(taskId)) {
            return error(res, 'Invalid task ID format', 400);
        }

        const validStatuses = ['todo', 'in_progress', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const result = await tasksModel.updateTaskStatus(taskId, status, requestingUser);

        await logAudit({
            tenantId: result.tenantId || requestingUser.tenantId,
            userId: requestingUser.userId,
            action: 'UPDATE_TASK_STATUS',
            entityType: 'task',
            entityId: taskId,
            ipAddress: req.ip,
        });

        return success(res, result);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/tasks/:taskId
 * Update task fields
 * Authorization: Task must belong to user's tenant; assignedTo must belong to same tenant if provided
 */
const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;
        const updates = req.body;

        // Validate taskId format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(taskId)) {
            return error(res, 'Invalid task ID format', 400);
        }

        // Validate fields if provided
        if (updates.title !== undefined && (typeof updates.title !== 'string' || updates.title.trim().length === 0)) {
            return error(res, 'title must be a non-empty string', 400);
        }

        if (updates.priority !== undefined) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(updates.priority)) {
                return error(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
            }
        }

        if (updates.status !== undefined) {
            const validStatuses = ['todo', 'in_progress', 'completed'];
            if (!validStatuses.includes(updates.status)) {
                return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
            }
        }

        if (updates.assignedTo !== undefined && updates.assignedTo !== null) {
            if (!uuidRegex.test(updates.assignedTo)) {
                return error(res, 'Invalid assignedTo user ID format', 400);
            }
        }

        if (updates.dueDate !== undefined && updates.dueDate !== null) {
            const d = new Date(updates.dueDate);
            if (isNaN(d.getTime())) {
                return error(res, 'Invalid dueDate', 400);
            }
            updates.dueDate = d;
        }

        const result = await tasksModel.updateTask(taskId, updates, requestingUser);

        await logAudit({
            tenantId: result.tenantId || requestingUser.tenantId,
            userId: requestingUser.userId,
            action: 'UPDATE_TASK',
            entityType: 'task',
            entityId: taskId,
            ipAddress: req.ip,
        });

        return success(res, result, 'Task updated successfully');
    } catch (err) {
        next(err);
    }
};


/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 * Authorization: tenant_admin or task creator; task must belong to user's tenant
 */
const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;

        // Validate taskId format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(taskId)) {
            return error(res, 'Invalid task ID format', 400);
        }

        const result = await tasksModel.deleteTask(taskId, requestingUser);

        await logAudit({
            tenantId: result.tenantId,
            userId: requestingUser.userId,
            action: 'DELETE_TASK',
            entityType: 'task',
            entityId: taskId,
            ipAddress: req.ip,
        });

        return success(res, {}, 'Task deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createTask,
    listProjectTasks,
    updateTaskStatus,
    updateTask,
    deleteTask,
};
