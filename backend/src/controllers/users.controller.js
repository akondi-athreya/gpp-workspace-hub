const usersModel = require('../models/users.model');
const { success, error } = require('../utils/responses');

/**
 * POST /api/tenants/:tenantId/users
 * Add user to tenant
 * Authorization: tenant_admin only
 */
const addUser = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const requestingUser = req.user;
    const { email, password, fullName, role } = req.body;

    // Validate tenantId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return error(res, 'Invalid tenant ID format', 400);
    }

    // Validate required fields
    if (!email || !password || !fullName) {
      return error(res, 'Email, password, and fullName are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error(res, 'Invalid email format', 400);
    }

    // Validate password strength (min 8 chars)
    if (password.length < 8) {
      return error(res, 'Password must be at least 8 characters long', 400);
    }

    // Validate role if provided
    if (role !== undefined) {
      const validRoles = ['user', 'tenant_admin'];
      if (!validRoles.includes(role)) {
        return error(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
      }
    }

    const userData = {
      email,
      password,
      fullName,
      role: role || 'user',
    };

    const user = await usersModel.addUser(tenantId, userData, requestingUser);

    return success(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tenants/:tenantId/users
 * List tenant users
 * Authorization: User must belong to this tenant
 */
const listUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const requestingUser = req.user;
    const { search, role, page, limit } = req.query;

    // Validate tenantId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return error(res, 'Invalid tenant ID format', 400);
    }

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

    if (role !== undefined) {
      const validRoles = ['super_admin', 'tenant_admin', 'user'];
      if (!validRoles.includes(role)) {
        return error(res, `Invalid role filter. Must be one of: ${validRoles.join(', ')}`, 400);
      }
    }

    const result = await usersModel.listUsers(tenantId, requestingUser, {
      search,
      role,
      page,
      limit,
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:userId
 * Update user
 * Authorization: tenant_admin OR self (limited fields)
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    const updates = req.body;

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return error(res, 'Invalid user ID format', 400);
    }

    // Validate that request body is not empty
    if (!updates || Object.keys(updates).length === 0) {
      return error(res, 'No update fields provided', 400);
    }

    // Validate field types
    if (updates.fullName !== undefined) {
      if (typeof updates.fullName !== 'string' || updates.fullName.trim().length === 0) {
        return error(res, 'fullName must be a non-empty string', 400);
      }
    }

    if (updates.role !== undefined) {
      const validRoles = ['super_admin', 'tenant_admin', 'user'];
      if (!validRoles.includes(updates.role)) {
        return error(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
      }
    }

    if (updates.isActive !== undefined) {
      if (typeof updates.isActive !== 'boolean') {
        return error(res, 'isActive must be a boolean', 400);
      }
    }

    const updatedUser = await usersModel.updateUser(userId, updates, requestingUser);

    return success(res, updatedUser, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:userId
 * Delete user
 * Authorization: tenant_admin only
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return error(res, 'Invalid user ID format', 400);
    }

    await usersModel.deleteUser(userId, requestingUser);

    return success(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUser,
  listUsers,
  updateUser,
  deleteUser,
};
