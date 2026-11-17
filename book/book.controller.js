
const bookService = require('./book.service');

const bookController = {
    create: async (req, res) => {
        try {
            const book = await bookService.create(req.body);
            res.status(201).json(book);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const books = await bookService.findAll(req.query);
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const book = await bookService.findById(req.params.id);

            if (!book) {
                return res.status(404).json({
                    error: 'Book not found'
                });
            }

            res.json(book);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const book = await bookService.update(
                req.params.id,
                req.body
            );

            if (!book) {
                return res.status(404).json({
                    error: 'Book not found'
                });
            }

            res.json(book);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const deleted = await bookService.delete(req.params.id);

            if (!deleted) {
                return res.status(404).json({
                    error: 'Book not found'
                });
            }

            res.json({
                message: 'Book deleted successfully'
            });
        } catch (error) {
            res.status(409).json({ error: error.message });
        }
    }
};

module.exports = bookController;
