const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

router.post('/', authenticateJWT, isAdmin, userController.createUser);
router.get('/', authenticateJWT, isAdmin, userController.getUsers);

module.exports = router;