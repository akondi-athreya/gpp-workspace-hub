const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenants.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

/**
 * GET /api/tenants/:tenantId
 * Get tenant details by ID
 * Access: Authenticated users (own tenant) or super_admin
 */
router.get('/:tenantId', authenticate, tenantsController.getTenantById);

/**
 * PUT /api/tenants/:tenantId
 * Update tenant
 * Access: tenant_admin (name only) or super_admin (all fields)
 */
router.put(
  '/:tenantId',
  authenticate,
  requireRole(['tenant_admin', 'super_admin']),
  tenantsController.updateTenant
);

/**
 * GET /api/tenants
 * List all tenants with pagination and filtering
 * Access: super_admin only
 */
router.get(
  '/',
  authenticate,
  requireRole(['super_admin']),
  tenantsController.listAllTenants
);

module.exports = router;
