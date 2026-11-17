const Category = require('./category.model');

const categoryService = {
    create: async (data) => {
        return await Category.create({
            name: data.name,
            description: data.description
        });
    },

    findAll: async () => {
        return await Category.findAll({
            order: [['name', 'ASC']]
        });
    },

    findById: async (id) => {
        return await Category.findByPk(id);
    },

    update: async (id, data) => {
        const category = await Category.findByPk(id);

        if (!category) {
            return null;
        }

        await category.update({
            name: data.name ?? category.name,
            description: data.description ?? category.description
        });

        return category;
    },

    delete: async (id) => {
        const category = await Category.findByPk(id);

        if (!category) {
            return null;
        }

        await category.destroy();
        return true;
    }
};

module.exports = categoryService;
