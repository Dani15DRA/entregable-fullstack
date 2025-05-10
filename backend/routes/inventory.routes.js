const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const inventoryController = require('../controllers/inventory.controller');

// Rutas protegidas (requieren autenticación)
router.get('/', authenticateJWT, inventoryController.getInventory);
router.get('/:id', authenticateJWT, inventoryController.getInventoryItem);
router.post('/', authenticateJWT, inventoryController.createOrUpdateInventory);
router.put('/:id', authenticateJWT, inventoryController.updateInventory);
router.delete('/:id', authenticateJWT, inventoryController.deleteInventory);

module.exports = router;