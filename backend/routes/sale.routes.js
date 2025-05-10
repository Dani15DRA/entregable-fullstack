// routes/sale.routes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const saleController = require('../controllers/sale.controller');
const { checkStock } = require('../middlewares/stock.middleware');

// Rutas protegidas
router.post('/', authenticateJWT, checkStock, saleController.createSale);
router.get('/', authenticateJWT, saleController.getSales);
router.get('/:id', authenticateJWT, saleController.getSaleById);
router.delete('/:id', authenticateJWT, saleController.cancelSale);

module.exports = router;