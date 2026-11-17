const { Router } = require('express');
const router = Router();

const reportsController = require('./reports.controller');

const {
    authMiddleware,
    isAdmin
} = require('../auth/auth.middleware');

router.use(authMiddleware, isAdmin);

router.get('/dashboard', reportsController.dashboard);

module.exports = router;