const authModel = require('../models/auth.model');
const { success, error } = require('../utils/responses');

/**
 * POST /api/auth/register-tenant
 * Register a new tenant with admin user
 */
const registerTenant = async (req, res, next) => {
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    // Validate required fields
    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      return error(res, 'All fields are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return error(res, 'Invalid email format', 400);
    }

    // Validate password strength (min 8 chars)
    if (adminPassword.length < 8) {
      return error(res, 'Password must be at least 8 characters long', 400);
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return error(res, 'Invalid subdomain format. Use lowercase letters, numbers, and hyphens only', 400);
    }

    const result = await authModel.registerTenant({
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName,
    });

    return success(res, result, 'Tenant registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Login user with email, password, and tenant subdomain
 */
const login = async (req, res, next) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // Validate required fields
    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const result = await authModel.login({
      email,
      password,
      tenantSubdomain,
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await authModel.getCurrentUser(userId);

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Logout user (JWT-only, just returns success)
 */
const logout = async (req, res, next) => {
  try {
    // For JWT-only auth, logout is handled client-side
    // Optionally log the action in audit logs here
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
};
