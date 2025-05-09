const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

router.post('/', authenticateJWT, isAdmin, userController.createUser);
router.get('/', authenticateJWT, isAdmin, userController.getUsers);
router.put('/:id', authenticateJWT, isAdmin, userController.updateUser); // Ruta para actualizar
router.delete('/:id', authenticateJWT, isAdmin, userController.deleteUser); // Ruta para eliminar

module.exports = router;