const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const movementController = require('../controllers/movement.controller');

// Rutas protegidas (requieren autenticación)
router.get('/', authenticateJWT, movementController.getMovements);
router.get('/:id', authenticateJWT, movementController.getMovementById);

module.exports = router;