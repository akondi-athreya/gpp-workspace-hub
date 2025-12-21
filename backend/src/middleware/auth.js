const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/responses');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return error(res, 'No token provided', 401);
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return error(res, 'Token expired', 401);
        }
        return error(res, 'Invalid token', 401);
    }
};

module.exports = { authenticate };
