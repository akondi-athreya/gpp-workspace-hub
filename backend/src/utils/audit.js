const { prisma } = require('../db/client');

// Write audit log; swallow errors to avoid blocking primary flow
async function logAudit({ tenantId = null, userId = null, action, entityType = null, entityId = null, ipAddress = null }) {
    try {
        await prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType,
                entityId,
                ipAddress,
            },
        });
    } catch (err) {
        console.error('Audit log failure:', err.message);
    }
}

module.exports = { logAudit };
