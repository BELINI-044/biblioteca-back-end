const { Router } = require('express');
const router = Router();

const categoryController = require('./category.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Consultas: administrador e atendente
router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);

// Alterações: somente administrador
router.post('/', isAdmin, categoryController.create);
router.put('/:id', isAdmin, categoryController.update);
router.delete('/:id', isAdmin, categoryController.delete);

module.exports = router;
