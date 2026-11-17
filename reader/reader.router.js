const { Router } = require('express');
const router = Router();

const readerController = require('./reader.controller');
const loanController = require('../loan/loan.controller');
const { authMiddleware } = require('../auth/auth.middleware');

router.use(authMiddleware);

router.get('/', readerController.findAll);
router.get('/:id/loans', loanController.findByReader);
router.get('/:id', readerController.findById);
router.post('/', readerController.create);
router.put('/:id', readerController.update);

module.exports = router;