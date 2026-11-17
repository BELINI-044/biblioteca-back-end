const { Router } = require('express');
const router = Router();

const userController = require('./user.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.use(authMiddleware, isAdmin);

router.post('/', userController.create);

router.get('/email/:email', userController.findByEmail);

router.patch('/:id/active', userController.setActive);

router.put('/:id', userController.update);
router.patch('/:id', userController.update);

router.get('/:id', userController.findById);
router.get('/', userController.findAll);

module.exports = router;