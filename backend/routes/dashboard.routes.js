// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/stats', authenticateJWT, isAdmin, dashboardController.getDashboardStats);
router.get('/sales-chart', authenticateJWT, isAdmin, dashboardController.getSalesChartData);
router.get('/top-products', authenticateJWT, isAdmin, dashboardController.getTopProducts);

module.exports = router;