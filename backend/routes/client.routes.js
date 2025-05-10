const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const clientController = require('../controllers/client.controller');

router.get('/', authenticateJWT, clientController.getClients);
router.get('/:id', authenticateJWT, clientController.getClientById);
router.post('/', authenticateJWT, clientController.createClient);
router.put('/:id', authenticateJWT, clientController.updateClient);
router.delete('/:id', authenticateJWT, clientController.deleteClient);

module.exports = router;