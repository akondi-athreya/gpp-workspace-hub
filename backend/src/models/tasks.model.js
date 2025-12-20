const { prisma } = require('../db/client');

/**
 * Create task (API 16)
 * Verify project belongs to user's tenant; get tenantId from project
 * If assignedTo provided, verify user belongs to same tenant
 */
const createTask = async (projectId, taskData, requestingUser) => {
    // Fetch project and verify tenant ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify project belongs to user's tenant
    if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== project.tenantId) {
        const error = new Error('Access denied. Project belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    // Get tenantId from project
    const tenantId = project.tenantId;

    // Validate assignedTo belongs to same tenant if provided
    if (taskData.assignedTo) {
        const assignee = await prisma.user.findUnique({ where: { id: taskData.assignedTo } });
        if (!assignee || assignee.tenantId !== tenantId) {
            const error = new Error('assignedTo user must belong to the same tenant');
            error.statusCode = 400;
            throw error;
        }
    }

    const created = await prisma.task.create({
        data: {
            projectId,
            tenantId,
            title: taskData.title,
            description: taskData.description || null,
            status: 'todo',
            priority: taskData.priority || 'medium',
            assignedTo: taskData.assignedTo || null,
            dueDate: taskData.dueDate || null,
        },
    });

    return {
        id: created.id,
        projectId: created.projectId,
        tenantId: created.tenantId,
        title: created.title,
        description: created.description,
        status: created.status,
        priority: created.priority,
        assignedTo: created.assignedTo,
        dueDate: created.dueDate,
        createdAt: created.createdAt,
    };
};

/**
 * List project tasks (API 17)
 * Verify project belongs to user's tenant
 */
const listProjectTasks = async (projectId, requestingUser, options = {}) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== project.tenantId) {
        const error = new Error('Access denied. Project belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    const {
        status,
        assignedTo,
        priority,
        search,
        page = 1,
        limit = 50,
    } = options;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const total = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' },
        ],
        include: {
            assignee: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });

    const formatted = tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignee ? {
            id: t.assignee.id,
            fullName: t.assignee.fullName,
            email: t.assignee.email,
        } : null,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
    }));

    return {
        tasks: formatted,
        total,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / take),
            limit: take,
        },
    };
};

/**
 * Update task status (API 18)
 * Any user in tenant can update
 */
const updateTaskStatus = async (taskId, status, requestingUser) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify task belongs to user's tenant
    if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== task.tenantId) {
        const error = new Error('Access denied. Task belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        select: {
            id: true,
            status: true,
            tenantId: true,
            updatedAt: true,
        },
    });

    return updated;
};

/**
 * Update task (API 19)
 * Verify task belongs to user's tenant; validate assignedTo tenant membership
 */
const updateTask = async (taskId, updates, requestingUser) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== task.tenantId) {
        const error = new Error('Access denied. Task belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    const data = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.priority !== undefined) data.priority = updates.priority;
    if (updates.dueDate !== undefined) data.dueDate = updates.dueDate;

    if (updates.assignedTo !== undefined) {
        if (updates.assignedTo === null) {
            data.assignedTo = null;
        } else {
            const assignee = await prisma.user.findUnique({ where: { id: updates.assignedTo } });
            if (!assignee || assignee.tenantId !== task.tenantId) {
                const error = new Error('assignedTo user must belong to the same tenant');
                error.statusCode = 400;
                throw error;
            }
            data.assignedTo = updates.assignedTo;
        }
    }

    if (Object.keys(data).length === 0) {
        const error = new Error('No valid fields to update');
        error.statusCode = 400;
        throw error;
    }

    const updated = await prisma.task.update({
        where: { id: taskId },
        data,
        include: {
            assignee: {
                select: { id: true, fullName: true, email: true },
            },
        },
    });

    return {
        id: updated.id,
        tenantId: updated.tenantId,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
        assignedTo: updated.assignee ? {
            id: updated.assignee.id,
            fullName: updated.assignee.fullName,
            email: updated.assignee.email,
        } : null,
        dueDate: updated.dueDate,
        updatedAt: updated.updatedAt,
    };
};


/**
 * DELETE task (API - DELETE /api/tasks/:taskId)
 * Verify task belongs to user's tenant
 * Authorization: tenant_admin or task creator
 */
const deleteTask = async (taskId, requestingUser) => {
    // Fetch task and verify ownership
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify task belongs to user's tenant
    if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== task.tenantId) {
        const error = new Error('Access denied. Task belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    // Verify authorization: tenant_admin OR task's project creator (as task creator equivalent)
    // For simplicity, check if user has tenant_admin role or is the project creator
    if (requestingUser.role !== 'super_admin' && requestingUser.role !== 'tenant_admin') {
        // Check if user is the task creator by checking if they created the project
        const project = await prisma.project.findUnique({ where: { id: task.projectId } });
        if (project.createdBy !== requestingUser.userId) {
            const error = new Error('Access denied. Only tenant_admin or task creator can delete tasks');
            error.statusCode = 403;
            throw error;
        }
    }

    // Delete the task
    const deleted = await prisma.task.delete({
        where: { id: taskId },
    });

    return {
        id: deleted.id,
        tenantId: deleted.tenantId,
    };
};

module.exports = {
    createTask,
    listProjectTasks,
    updateTaskStatus,
    updateTask,
    deleteTask,
};
