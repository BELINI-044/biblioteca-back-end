const authService = require('./auth.service');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const tokens = await authService.login(email, password);
            res.json(tokens);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refresh(refreshToken);
            res.json(tokens);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const authorization = req.headers.authorization;

            const accessToken = authorization &&
                authorization.startsWith('Bearer ')
                ? authorization.substring(7)
                : null;

            await authService.logout(refreshToken, accessToken);

            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async me(req, res) {
        res.json({
            user: req.user
        });
    }
};

module.exports = authController;
