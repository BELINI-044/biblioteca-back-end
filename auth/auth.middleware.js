const authService = require('./auth.service');

const authMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Access denied. No token provided.'
        });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
        return res.status(401).json({
            error: 'Access token is missing.'
        });
    }

    try {
        const decoded = await authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token.'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required.'
        });
    }

    if (req.user.isAdmin !== true) {
        return res.status(403).json({
            error: 'Access denied. Administrator only.'
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    isAdmin
};
