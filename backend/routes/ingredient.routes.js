const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const ingredientController = require('../controllers/ingredient.controller');

router.get('/', authenticateJWT, isAdmin, ingredientController.getIngredients);
router.post('/', authenticateJWT, isAdmin, ingredientController.createIngredient);
router.put('/:id', authenticateJWT, isAdmin, ingredientController.updateIngredient);
router.delete('/:id', authenticateJWT, isAdmin, ingredientController.deleteIngredient);
router.post('/:id/ingredients', authenticateJWT, isAdmin, ingredientController.addIngredientToProduct);
router.delete('/:id/ingredients/:ingredientId', authenticateJWT, isAdmin, ingredientController.removeIngredientFromProduct);

module.exports = router;