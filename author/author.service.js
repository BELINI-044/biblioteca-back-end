const Author = require('./author.model');

const authorService = {
    create: async (data) => {
        return await Author.create({
            name: data.name,
            nationality: data.nationality,
            birthDate: data.birthDate
        });
    },

    findAll: async () => {
        return await Author.findAll({
            order: [['name', 'ASC']]
        });
    },

    findById: async (id) => {
        return await Author.findByPk(id);
    },

    update: async (id, data) => {
        const author = await Author.findByPk(id);

        if (!author) {
            return null;
        }

        await author.update({
            name: data.name ?? author.name,
            nationality: data.nationality ?? author.nationality,
            birthDate: data.birthDate ?? author.birthDate
        });

        return author;
    },

    delete: async (id) => {
        const author = await Author.findByPk(id);

        if (!author) {
            return null;
        }

        await author.destroy();
        return true;
    }
};

module.exports = authorService;
