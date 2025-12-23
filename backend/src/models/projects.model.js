const { prisma } = require('../db/client');

/**
 * Create project (API 12)
 * Authorization: Authenticated users
 * Check max_projects limit before creating
 */
const createProject = async (projectData, requestingUser) => {
    // Get tenantId from JWT token automatically
    const tenantId = requestingUser.tenantId;

    if (!tenantId) {
        const error = new Error('Access denied. Super admin cannot create projects without a tenant');
        error.statusCode = 403;
        throw error;
    }

    // Check if tenant exists and get maxProjects limit
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        const error = new Error('Tenant not found');
        error.statusCode = 404;
        throw error;
    }

    // Check current project count
    const currentProjectCount = await prisma.project.count({
        where: { tenantId },
    });

    if (currentProjectCount >= tenant.maxProjects) {
        const error = new Error('Project limit reached. Cannot create more projects');
        error.statusCode = 403;
        throw error;
    }

    // Create project
    const project = await prisma.project.create({
        data: {
            tenantId,
            name: projectData.name,
            description: projectData.description || null,
            status: projectData.status || 'active',
            createdBy: requestingUser.userId,
        },
    });

    return {
        id: project.id,
        tenantId: project.tenantId,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
    };
};

/**
 * List projects (API 13)
 * Authorization: Authenticated users (filtered by their tenant)
 */
const listProjects = async (requestingUser, options = {}) => {
    // Get tenantId from JWT token
    const tenantId = requestingUser.tenantId;

    if (!tenantId) {
        const error = new Error('Access denied. Super admin must specify a tenant');
        error.statusCode = 403;
        throw error;
    }

    const {
        status,
        search,
        page = 1,
        limit = 20,
    } = options;

    // Build where clause - always filter by tenant
    const where = {
        tenantId,
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.name = {
            contains: search,
            mode: 'insensitive',
        };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Get total count
    const total = await prisma.project.count({ where });

    // Fetch projects with creator info and task counts
    const projects = await prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
            creator: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            _count: {
                select: {
                    tasks: true,
                },
            },
            tasks: {
                where: { status: 'completed' },
                select: { id: true },
            },
        },
    });

    // Format response
    const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: {
            id: project.creator.id,
            fullName: project.creator.fullName,
        },
        taskCount: project._count.tasks,
        completedTaskCount: project.tasks.length,
        createdAt: project.createdAt,
    }));

    return {
        projects: formattedProjects,
        total,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / take),
            limit: take,
        },
    };
};

// Get single project with tasks and stats
const getProjectById = async (projectId, requestingUser) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            creator: {
                select: { id: true, fullName: true },
            },
            tasks: {
                orderBy: { createdAt: 'desc' },
                include: {
                    assignee: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
            },
        },
    });

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    if (project.tenantId !== requestingUser.tenantId) {
        const error = new Error('Access denied. Project belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;

    return {
        id: project.id,
        tenantId: project.tenantId,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: {
            id: project.creator.id,
            fullName: project.creator.fullName,
        },
        taskCount: project.tasks.length,
        completedTaskCount: completedTasks,
        tasks: project.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            assignedTo: task.assignee
                ? { id: task.assignee.id, fullName: task.assignee.fullName, email: task.assignee.email }
                : null,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    };
};

/**
 * Update project (API 14)
 * Authorization: tenant_admin OR project creator
 */
const updateProject = async (projectId, updates, requestingUser) => {
    // Find project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify project belongs to user's tenant
    if (requestingUser.tenantId !== project.tenantId) {
        const error = new Error('Access denied. Project belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    // Authorization: Only tenant_admin or creator can update
    if (
        requestingUser.role !== 'tenant_admin' &&
        requestingUser.userId !== project.createdBy
    ) {
        const error = new Error('Access denied. Only tenant admin or project creator can update');
        error.statusCode = 403;
        throw error;
    }

    // Prepare update data (partial update)
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;

    // Check if there are any updates to apply
    if (Object.keys(updateData).length === 0) {
        const error = new Error('No valid fields to update');
        error.statusCode = 400;
        throw error;
    }

    // Update project
    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: updateData,
    });

    return {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
    };
};

/**
 * Delete project (API 15)
 * Authorization: tenant_admin OR project creator
 * Cascade delete tasks
 */
const deleteProject = async (projectId, requestingUser) => {
    // Find project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify project belongs to user's tenant
    if (requestingUser.tenantId !== project.tenantId) {
        const error = new Error('Access denied. Project belongs to different tenant');
        error.statusCode = 403;
        throw error;
    }

    // Authorization: Only tenant_admin or creator can delete
    if (
        requestingUser.role !== 'tenant_admin' &&
        requestingUser.userId !== project.createdBy
    ) {
        const error = new Error('Access denied. Only tenant admin or project creator can delete');
        error.statusCode = 403;
        throw error;
    }

    // Delete project (tasks will cascade delete due to foreign key)
    await prisma.project.delete({
        where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
};

module.exports = {
    createProject,
    listProjects,
    getProjectById,
    updateProject,
    deleteProject,
};
