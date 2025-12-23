const { error } = require('../utils/responses');

const requireRole = (...allowedRoles) => {
    // Support callers passing an array (e.g., requireRole(['a','b'])) or variadic strings
    const roles = allowedRoles.length === 1 && Array.isArray(allowedRoles[0])
        ? allowedRoles[0]
        : allowedRoles;

    return (req, res, next) => {
        if (!req.user) {
            return error(res, 'Unauthorized', 401);
        }

        if (!roles.includes(req.user.role)) {
            return error(res, 'Forbidden: insufficient permissions', 403);
        }

        next();
    };
};

const requireSuperAdmin = requireRole('super_admin');
const requireTenantAdmin = requireRole('tenant_admin', 'super_admin');

module.exports = { requireRole, requireSuperAdmin, requireTenantAdmin };
