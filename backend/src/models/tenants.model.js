const { prisma } = require('../../db/client');

/**
 * Get tenant by ID
 * Authorization: User must belong to the tenant OR be super_admin
 */
const getTenantById = async (tenantId, requestingUser) => {
  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    const error = new Error('Tenant not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check:
  // - super_admin can access any tenant
  // - regular users can only access their own tenant
  if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== tenantId) {
    const error = new Error('Access denied. You can only view your own tenant');
    error.statusCode = 403;
    throw error;
  }

  return {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    status: tenant.status,
    subscriptionPlan: tenant.subscriptionPlan,
    maxUsers: tenant.maxUsers,
    maxProjects: tenant.maxProjects,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
};

/**
 * Update tenant
 * Authorization:
 * - tenant_admin can only update 'name'
 * - super_admin can update status, subscriptionPlan, maxUsers, maxProjects
 */
const updateTenant = async (tenantId, updates, requestingUser) => {
  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    const error = new Error('Tenant not found');
    error.statusCode = 404;
    throw error;
  }

  // Determine allowed fields based on role
  let allowedUpdates = {};

  if (requestingUser.role === 'super_admin') {
    // super_admin can update: name, status, subscriptionPlan, maxUsers, maxProjects
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.status !== undefined) allowedUpdates.status = updates.status;
    if (updates.subscriptionPlan !== undefined) allowedUpdates.subscriptionPlan = updates.subscriptionPlan;
    if (updates.maxUsers !== undefined) allowedUpdates.maxUsers = updates.maxUsers;
    if (updates.maxProjects !== undefined) allowedUpdates.maxProjects = updates.maxProjects;
  } else if (requestingUser.role === 'tenant_admin') {
    // tenant_admin can only update their own tenant's name
    if (requestingUser.tenantId !== tenantId) {
      const error = new Error('Access denied. You can only update your own tenant');
      error.statusCode = 403;
      throw error;
    }

    // Only allow name update
    if (updates.name !== undefined) {
      allowedUpdates.name = updates.name;
    }

    // Reject if trying to update other fields
    const attemptedFields = Object.keys(updates);
    const restrictedFields = attemptedFields.filter(field => field !== 'name');
    if (restrictedFields.length > 0) {
      const error = new Error(`Tenant admins can only update the 'name' field. Cannot update: ${restrictedFields.join(', ')}`);
      error.statusCode = 403;
      throw error;
    }
  } else {
    // Regular users cannot update tenants
    const error = new Error('Access denied. Only tenant admins and super admins can update tenants');
    error.statusCode = 403;
    throw error;
  }

  // Check if there are any updates to apply
  if (Object.keys(allowedUpdates).length === 0) {
    const error = new Error('No valid fields to update');
    error.statusCode = 400;
    throw error;
  }

  // Perform the update
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: allowedUpdates,
  });

  return {
    id: updatedTenant.id,
    name: updatedTenant.name,
    subdomain: updatedTenant.subdomain,
    status: updatedTenant.status,
    subscriptionPlan: updatedTenant.subscriptionPlan,
    maxUsers: updatedTenant.maxUsers,
    maxProjects: updatedTenant.maxProjects,
    createdAt: updatedTenant.createdAt,
    updatedAt: updatedTenant.updatedAt,
  };
};

/**
 * List all tenants with pagination and filtering
 * Authorization: super_admin only
 */
const listAllTenants = async (requestingUser, options = {}) => {
  // Only super_admin can list all tenants
  if (requestingUser.role !== 'super_admin') {
    const error = new Error('Access denied. Only super admins can list all tenants');
    error.statusCode = 403;
    throw error;
  }

  const {
    page = 1,
    limit = 10,
    status,
    subscriptionPlan,
    search,
  } = options;

  // Build where clause for filtering
  const where = {};

  if (status) {
    where.status = status;
  }

  if (subscriptionPlan) {
    where.subscriptionPlan = subscriptionPlan;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { subdomain: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  // Get total count for pagination
  const total = await prisma.tenant.count({ where });

  // Fetch tenants
  const tenants = await prisma.tenant.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          projects: true,
        },
      },
    },
  });

  // Format response
  const formattedTenants = tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    status: tenant.status,
    subscriptionPlan: tenant.subscriptionPlan,
    maxUsers: tenant.maxUsers,
    maxProjects: tenant.maxProjects,
    currentUsers: tenant._count.users,
    currentProjects: tenant._count.projects,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  }));

  return {
    tenants: formattedTenants,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

module.exports = {
  getTenantById,
  updateTenant,
  listAllTenants,
};
