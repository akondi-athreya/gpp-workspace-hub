const { error } = require('../utils/responses');

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return error(res, 'Unauthorized', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return error(res, 'Forbidden: insufficient permissions', 403);
        }

        next();
    };
};

const requireSuperAdmin = requireRole('super_admin');
const requireTenantAdmin = requireRole('tenant_admin', 'super_admin');

module.exports = { requireRole, requireSuperAdmin, requireTenantAdmin };
