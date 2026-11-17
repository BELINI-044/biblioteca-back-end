
const { Op } = require('sequelize');
const db = require('../config/db');
const { Book, Category, Author } = require('../models');

const bookIncludes = [
    { model: Category },
    {
        model: Author,
        through: { attributes: [] }
    }
];

const normalizeAuthorIds = (authorIds) => {
    if (!Array.isArray(authorIds)) {
        throw new Error('authorIds must be an array');
    }

    const ids = [...new Set(authorIds.map(Number))];

    if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
        throw new Error('Invalid author ID');
    }

    return ids;
};

const bookService = {
    create: async (data) => {
        if (!data.title || !data.isbn) {
            throw new Error('Title and ISBN are required');
        }

        const categoryId = Number(data.categoryId);
        const totalCopies = Number(data.totalCopies ?? 1);
        const authorIds = normalizeAuthorIds(data.authorIds ?? []);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            throw new Error('Invalid category ID');
        }

        if (!Number.isInteger(totalCopies) || totalCopies < 1) {
            throw new Error('Invalid total copies');
        }

        return await db.transaction(async (transaction) => {
            const category = await Category.findByPk(categoryId, {
                transaction
            });

            if (!category) {
                throw new Error('Category not found');
            }

            const authors = await Author.findAll({
                where: { id: authorIds },
                transaction
            });

            if (authors.length !== authorIds.length) {
                throw new Error('One or more authors were not found');
            }

            const book = await Book.create({
                title: data.title,
                isbn: data.isbn,
                year: data.year,
                totalCopies,
                availableCopies: totalCopies,
                categoryId
            }, { transaction });

            await book.setAuthors(authors, { transaction });

            return await Book.findByPk(book.id, {
                include: bookIncludes,
                transaction
            });
        });
    },

    findAll: async (filters = {}) => {
        const where = {};

        if (filters.title) {
            where.title = {
                [Op.like]: `%${filters.title}%`
            };
        }

        if (filters.categoryId) {
            where.categoryId = Number(filters.categoryId);
        }

        if (filters.available === 'true') {
            where.availableCopies = {
                [Op.gt]: 0
            };
        }

        const authorInclude = {
            model: Author,
            through: { attributes: [] }
        };

        if (filters.authorId) {
            authorInclude.where = {
                id: Number(filters.authorId)
            };
            authorInclude.required = true;
        }

        return await Book.findAll({
            where,
            include: [
                { model: Category },
                authorInclude
            ],
            order: [['title', 'ASC']]
        });
    },

    findById: async (id) => {
        return await Book.findByPk(id, {
            include: bookIncludes
        });
    },

    update: async (id, data) => {
        return await db.transaction(async (transaction) => {
            const book = await Book.findByPk(id, { transaction });

            if (!book) {
                return null;
            }

            const updates = {};

            if (data.title !== undefined) {
                updates.title = data.title;
            }

            if (data.isbn !== undefined) {
                updates.isbn = data.isbn;
            }

            if (data.year !== undefined) {
                updates.year = data.year;
            }

            if (data.categoryId !== undefined) {
                const categoryId = Number(data.categoryId);

                const category = await Category.findByPk(categoryId, {
                    transaction
                });

                if (!category) {
                    throw new Error('Category not found');
                }

                updates.categoryId = categoryId;
            }

            if (data.totalCopies !== undefined) {
                const totalCopies = Number(data.totalCopies);

                const availableCopies = book.availableCopies +
                    (totalCopies - book.totalCopies);

                if (!Number.isInteger(totalCopies) ||
                    totalCopies < 1 ||
                    availableCopies < 0) {
                    throw new Error('Invalid total copies');
                }

                updates.totalCopies = totalCopies;
                updates.availableCopies = availableCopies;
            }

            await book.update(updates, { transaction });

            if (data.authorIds !== undefined) {
                const authorIds = normalizeAuthorIds(data.authorIds);

                const authors = await Author.findAll({
                    where: { id: authorIds },
                    transaction
                });

                if (authors.length !== authorIds.length) {
                    throw new Error('One or more authors were not found');
                }

                await book.setAuthors(authors, { transaction });
            }

            return await Book.findByPk(id, {
                include: bookIncludes,
                transaction
            });
        });
    },

    delete: async (id) => {
        const book = await Book.findByPk(id);

        if (!book) {
            return null;
        }

        await book.destroy();

        return true;
    }
};

module.exports = bookService;
