
const { Router } = require('express');
const router = Router();

const bookController = require('./book.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Consultas: administrador e atendente
router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);

// Alterações: somente administrador
router.post('/', isAdmin, bookController.create);
router.put('/:id', isAdmin, bookController.update);
router.delete('/:id', isAdmin, bookController.delete);

module.exports = router;
