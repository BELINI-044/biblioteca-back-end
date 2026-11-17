const { Router } = require('express');
const router = Router();

const authorController = require('./author.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Consultas: administrador e atendente
router.get('/', authorController.findAll);
router.get('/:id', authorController.findById);

// Alterações: somente administrador
router.post('/', isAdmin, authorController.create);
router.put('/:id', isAdmin, authorController.update);
router.delete('/:id', isAdmin, authorController.delete);

module.exports = router;
