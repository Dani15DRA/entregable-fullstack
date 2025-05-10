const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const supplierController = require('../controllers/supplier.controller');

router.get('/', authenticateJWT, supplierController.getSuppliers);
router.get('/:id', authenticateJWT, supplierController.getSupplierById);
router.post('/', authenticateJWT, isAdmin, supplierController.createSupplier);
router.put('/:id', authenticateJWT, isAdmin, supplierController.updateSupplier);
router.delete('/:id', authenticateJWT, isAdmin, supplierController.deleteSupplier);

module.exports = router;