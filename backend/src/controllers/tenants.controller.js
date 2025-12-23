const tenantsModel = require('../models/tenants.model');
const { success, error } = require('../utils/responses');
const { logAudit } = require('../utils/audit');

/**
 * GET /api/tenants/:tenantId
 * Get tenant details by ID
 * Authorization: User must belong to the tenant OR be super_admin
 */
const getTenantById = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const requestingUser = req.user; // From auth middleware

    // Validate tenantId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return error(res, 'Invalid tenant ID format', 400);
    }

    const tenant = await tenantsModel.getTenantById(tenantId, requestingUser);

    return success(res, tenant);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/tenants/:tenantId
 * Update tenant
 * Authorization:
 * - tenant_admin can only update 'name' of their own tenant
 * - super_admin can update status, subscriptionPlan, maxUsers, maxProjects of any tenant
 */
const updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const requestingUser = req.user; // From auth middleware
    const updates = req.body;

    // Validate tenantId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return error(res, 'Invalid tenant ID format', 400);
    }

    // Validate that request body is not empty
    if (!updates || Object.keys(updates).length === 0) {
      return error(res, 'No update fields provided', 400);
    }

    // Validate field types and values
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return error(res, 'Tenant name must be a non-empty string', 400);
      }
    }

    if (updates.status !== undefined) {
      const validStatuses = ['active', 'suspended', 'trial'];
      if (!validStatuses.includes(updates.status)) {
        return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    if (updates.subscriptionPlan !== undefined) {
      const validPlans = ['free', 'pro', 'enterprise'];
      if (!validPlans.includes(updates.subscriptionPlan)) {
        return error(res, `Invalid subscription plan. Must be one of: ${validPlans.join(', ')}`, 400);
      }
    }

    if (updates.maxUsers !== undefined) {
      if (!Number.isInteger(updates.maxUsers) || updates.maxUsers < 1) {
        return error(res, 'maxUsers must be a positive integer', 400);
      }
    }

    if (updates.maxProjects !== undefined) {
      if (!Number.isInteger(updates.maxProjects) || updates.maxProjects < 1) {
        return error(res, 'maxProjects must be a positive integer', 400);
      }
    }

    const updatedTenant = await tenantsModel.updateTenant(tenantId, updates, requestingUser);

    await logAudit({
      tenantId,
      userId: requestingUser.userId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
      ipAddress: req.ip,
    });

    return success(res, updatedTenant, 'Tenant updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tenants
 * List all tenants with pagination and filtering
 * Authorization: super_admin only
 */
const listAllTenants = async (req, res, next) => {
  try {
    const requestingUser = req.user; // From auth middleware

    // Extract query parameters
    const {
      page,
      limit,
      status,
      subscriptionPlan,
      search,
    } = req.query;

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
      const validStatuses = ['active', 'suspended', 'trial'];
      if (!validStatuses.includes(status)) {
        return error(res, `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    if (subscriptionPlan !== undefined) {
      const validPlans = ['free', 'pro', 'enterprise'];
      if (!validPlans.includes(subscriptionPlan)) {
        return error(res, `Invalid subscription plan filter. Must be one of: ${validPlans.join(', ')}`, 400);
      }
    }

    const result = await tenantsModel.listAllTenants(requestingUser, {
      page,
      limit,
      status,
      subscriptionPlan,
      search,
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTenantById,
  updateTenant,
  listAllTenants,
};
