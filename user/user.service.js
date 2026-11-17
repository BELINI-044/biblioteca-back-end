const bcrypt = require('bcrypt');
const User = require('./user.model');

const safeUser = (user) => {
    const data = user.get({ plain: true });
    delete data.password;
    return data;
};

const userService = {
    create: async (userData) => {
        try {
            if (!userData.name || !userData.username ||
                !userData.email || !userData.password) {
                throw new Error('All required fields must be provided');
            }

            const password = await bcrypt.hash(userData.password, 10);

            const user = await User.create({
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password,
                isAdmin: false,
                active: true
            });

            return safeUser(user);
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    },

    findById: async (id) => {
        const user = await User.findByPk(id);
        return user ? safeUser(user) : null;
    },

    // Mantém a senha disponível internamente para autenticação.
    findByEmail: async (email) => {
        return await User.findOne({ where: { email } });
    },

    findAll: async () => {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['name', 'ASC']]
        });

        return users;
    },

    update: async (id, data) => {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        const updates = {};

        for (const field of ['name', 'username', 'email']) {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        }

        if (data.password) {
            updates.password = await bcrypt.hash(data.password, 10);
        }

        await user.update(updates);

        return safeUser(user);
    },

    setActive: async (id, active) => {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        if (user.isAdmin) {
            throw new Error('Administrator cannot be deactivated here');
        }

        await user.update({ active });

        return safeUser(user);
    }
};

module.exports = userService;