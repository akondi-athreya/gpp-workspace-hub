const { prisma } = require('../db/client');
const { hashPassword } = require('../utils/crypto');

/**
 * Add user to tenant (API 8)
 * Authorization: tenant_admin only
 * Check max_users limit before creating
 */
const addUser = async (tenantId, userData, requestingUser) => {
  // Authorization: Only tenant_admin can add users
  if (requestingUser.role !== 'tenant_admin') {
    const error = new Error('Access denied. Only tenant admins can add users');
    error.statusCode = 403;
    throw error;
  }

  // Verify requesting user belongs to this tenant
  if (requestingUser.tenantId !== tenantId) {
    const error = new Error('Access denied. You can only add users to your own tenant');
    error.statusCode = 403;
    throw error;
  }

  // Check if tenant exists and get maxUsers limit
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    const error = new Error('Tenant not found');
    error.statusCode = 404;
    throw error;
  }

  // Check current user count
  const currentUserCount = await prisma.user.count({
    where: { tenantId },
  });

  if (currentUserCount >= tenant.maxUsers) {
    const error = new Error('Subscription limit reached. Cannot add more users');
    error.statusCode = 403;
    throw error;
  }

  // Check if email already exists in this tenant
  const existingUser = await prisma.user.findFirst({
    where: {
      tenantId,
      email: userData.email,
    },
  });

  if (existingUser) {
    const error = new Error('Email already exists in this tenant');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId,
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      role: userData.role || 'user',
      isActive: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    tenantId: user.tenantId,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

/**
 * List tenant users (API 9)
 * Authorization: User must belong to this tenant
 */
const listUsers = async (tenantId, requestingUser, options = {}) => {
  // Authorization: User must belong to this tenant OR be super_admin
  if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== tenantId) {
    const error = new Error('Access denied. You can only view users from your own tenant');
    error.statusCode = 403;
    throw error;
  }

  const {
    search,
    role,
    page = 1,
    limit = 50,
  } = options;

  // Build where clause
  const where = {
    tenantId,
  };

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  // Get total count
  const total = await prisma.user.count({ where });

  // Fetch users
  const users = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    users,
    total,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / take),
      limit: take,
    },
  };
};

/**
 * Update user (API 10)
 * Authorization: tenant_admin OR self (limited fields)
 */
const updateUser = async (userId, updates, requestingUser) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: user must belong to same tenant OR be super_admin
  if (requestingUser.role !== 'super_admin' && requestingUser.tenantId !== user.tenantId) {
    const error = new Error('Access denied. You can only update users from your own tenant');
    error.statusCode = 403;
    throw error;
  }

  let allowedUpdates = {};

  // Determine allowed fields based on role
  if (requestingUser.userId === userId) {
    // User updating themselves - can only update fullName
    if (updates.fullName !== undefined) {
      allowedUpdates.fullName = updates.fullName;
    }

    // Reject if trying to update other fields
    const attemptedFields = Object.keys(updates);
    const restrictedFields = attemptedFields.filter(field => field !== 'fullName');
    if (restrictedFields.length > 0) {
      const error = new Error(`Users can only update their own 'fullName'. Cannot update: ${restrictedFields.join(', ')}`);
      error.statusCode = 403;
      throw error;
    }
  } else if (requestingUser.role === 'tenant_admin' || requestingUser.role === 'super_admin') {
    // tenant_admin or super_admin can update role and isActive
    if (updates.fullName !== undefined) allowedUpdates.fullName = updates.fullName;
    if (updates.role !== undefined) allowedUpdates.role = updates.role;
    if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;
  } else {
    const error = new Error('Access denied. You cannot update other users');
    error.statusCode = 403;
    throw error;
  }

  // Check if there are any updates to apply
  if (Object.keys(allowedUpdates).length === 0) {
    const error = new Error('No valid fields to update');
    error.statusCode = 400;
    throw error;
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user (API 11)
 * Authorization: tenant_admin only
 * Cannot delete self
 */
const deleteUser = async (userId, requestingUser) => {
  // Authorization: Only tenant_admin can delete users
  if (requestingUser.role !== 'tenant_admin') {
    const error = new Error('Access denied. Only tenant admins can delete users');
    error.statusCode = 403;
    throw error;
  }

  // Cannot delete self
  if (requestingUser.userId === userId) {
    const error = new Error('Cannot delete yourself');
    error.statusCode = 403;
    throw error;
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify user belongs to same tenant
  if (requestingUser.tenantId !== user.tenantId) {
    const error = new Error('Access denied. You can only delete users from your own tenant');
    error.statusCode = 403;
    throw error;
  }

  // Set assigned_to to NULL in tasks before deleting user
  await prisma.task.updateMany({
    where: { assignedTo: userId },
    data: { assignedTo: null },
  });

  // Delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'User deleted successfully' };
};

module.exports = {
  addUser,
  listUsers,
  updateUser,
  deleteUser,
};
