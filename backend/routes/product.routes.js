const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

// Rutas públicas
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Rutas protegidas (solo admin)
router.post('/', authenticateJWT, isAdmin, productController.createProduct);
router.put('/:id', authenticateJWT, isAdmin, productController.updateProduct);
router.delete('/:id', authenticateJWT, isAdmin, productController.deleteProduct);

module.exports = router;