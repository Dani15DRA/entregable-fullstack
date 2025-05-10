const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

// Rutas públicas
router.get('/', productController.getProducts);
router.get('/active-select', productController.getActiveProductsForSelect); // Nueva ruta
router.get('/:id', productController.getProductById);

// Rutas protegidas (requieren autenticación y ser admin)
router.post('/', authenticateJWT, isAdmin, productController.createProduct);
router.put('/:id', authenticateJWT, isAdmin, productController.updateProduct);
router.delete('/:id', authenticateJWT, isAdmin, productController.deleteProduct);

module.exports = router;