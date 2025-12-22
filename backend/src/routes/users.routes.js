const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

/**
 * POST /api/tenants/:tenantId/users
 * Add user to tenant
 * Access: tenant_admin only
 */
router.post(
  '/tenants/:tenantId/users',
  authenticate,
  requireRole(['tenant_admin']),
  usersController.addUser
);

/**
 * GET /api/tenants/:tenantId/users
 * List tenant users
 * Access: Authenticated users (own tenant) or super_admin
 */
router.get(
  '/tenants/:tenantId/users',
  authenticate,
  usersController.listUsers
);

/**
 * PUT /api/users/:userId
 * Update user
 * Access: tenant_admin or self (limited fields)
 */
router.put(
  '/users/:userId',
  authenticate,
  usersController.updateUser
);

/**
 * DELETE /api/users/:userId
 * Delete user
 * Access: tenant_admin only
 */
router.delete(
  '/users/:userId',
  authenticate,
  requireRole(['tenant_admin']),
  usersController.deleteUser
);

module.exports = router;
