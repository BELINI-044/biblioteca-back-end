const userService = require('./user.service');

const userController = {
    create: async (req, res) => {
        try {
            const user = await userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const user = await userService.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    findByEmail: async (req, res) => {
        try {
            const user = await userService.findByEmail(req.params.email);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const data = user.get({ plain: true });
            delete data.password;

            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const users = await userService.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const user = await userService.update(
                req.params.id,
                req.body
            );

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    setActive: async (req, res) => {
        try {
            const { active } = req.body;

            if (typeof active !== 'boolean') {
                return res.status(400).json({
                    error: 'Active must be true or false'
                });
            }

            const user = await userService.setActive(
                req.params.id,
                active
            );

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json({
                message: active
                    ? 'User activated successfully'
                    : 'User deactivated successfully',
                user
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = userController;