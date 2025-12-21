const { error } = require('../utils/responses');

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        return error(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return error(res, 'Token expired', 401);
    }

    if (err.name === 'ZodError') {
        return error(res, 'Validation error: ' + err.issues.map(i => i.message).join(', '), 400);
    }

    // Prisma errors
    if (err.code === 'P2002') {
        return error(res, 'Unique constraint violation', 409);
    }

    if (err.code === 'P2025') {
        return error(res, 'Record not found', 404);
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    return error(res, message, statusCode);
};

module.exports = { errorHandler };
