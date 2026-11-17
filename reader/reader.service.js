const Reader = require('./reader.model');

const readerService = {
    create: async (data) => {
        if (!data.name || !data.cpf) {
            throw new Error('Name and CPF are required');
        }

        return await Reader.create({
            name: data.name.trim(),
            cpf: String(data.cpf).trim(),
            email: data.email || null,
            phone: data.phone || null
        });
    },

    findAll: async () => {
        return await Reader.findAll({
            order: [['name', 'ASC']]
        });
    },

    findById: async (id) => {
        return await Reader.findByPk(id);
    },

    update: async (id, data) => {
        const reader = await Reader.findByPk(id);

        if (!reader) {
            return null;
        }

        await reader.update({
            name: data.name !== undefined
                ? data.name.trim()
                : reader.name,

            cpf: data.cpf !== undefined
                ? String(data.cpf).trim()
                : reader.cpf,

            email: data.email !== undefined
                ? data.email
                : reader.email,

            phone: data.phone !== undefined
                ? data.phone
                : reader.phone
        });

        return reader;
    }
};

module.exports = readerService;