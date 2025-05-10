const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const warehouseController = require('../controllers/warehouse.controller');

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateJWT, isAdmin, warehouseController.createWarehouse);
router.get('/', authenticateJWT, warehouseController.getWarehouses);
router.get('/:id', authenticateJWT, warehouseController.getWarehouseById);
router.put('/:id', authenticateJWT, isAdmin, warehouseController.updateWarehouse);
router.delete('/:id', authenticateJWT, isAdmin, warehouseController.deleteWarehouse);

module.exports = router;