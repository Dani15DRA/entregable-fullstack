const db = require('../config/db');

// Listar ingredientes
const getIngredients = async (req, res) => {
  try {
    const [ingredients] = await db.execute('SELECT * FROM active_ingredients');
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ingredientes' });
  }
};

// Crear ingrediente
const createIngredient = async (req, res) => {
  const { name, concentration } = req.body;
  
  try {
    const [result] = await db.execute(
      'INSERT INTO active_ingredients (name, concentration) VALUES (?, ?)',
      [name, concentration]
    );
    
    res.status(201).json({ 
      message: 'Ingrediente creado exitosamente',
      ingredientId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear ingrediente' });
  }
};

// Añadir ingrediente a producto
const addIngredientToProduct = async (req, res) => {
  const { id: productId } = req.params;
  const { ingredientId } = req.body;
  
  try {
    await db.execute(
      'INSERT INTO product_ingredients (product_id, ingredient_id) VALUES (?, ?)',
      [productId, ingredientId]
    );
    
    res.status(201).json({ message: 'Ingrediente añadido al producto' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El ingrediente ya está asociado a este producto' });
    }
    res.status(500).json({ message: 'Error al añadir ingrediente' });
  }
};

// Quitar ingrediente de producto
const removeIngredientFromProduct = async (req, res) => {
  const { id: productId, ingredientId } = req.params;
  
  try {
    const [result] = await db.execute(
      'DELETE FROM product_ingredients WHERE product_id = ? AND ingredient_id = ?',
      [productId, ingredientId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }
    
    res.json({ message: 'Ingrediente removido del producto' });
  } catch (err) {
    res.status(500).json({ message: 'Error al remover ingrediente' });
  }
};
// Actualizar ingrediente
const updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name, concentration } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE active_ingredients SET name = ?, concentration = ? WHERE id = ?',
      [name, concentration, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    
    res.json({ message: 'Ingrediente actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar ingrediente' });
  }
};

// Eliminar ingrediente
const deleteIngredient = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Primero eliminamos las relaciones en product_ingredients
    await db.execute(
      'DELETE FROM product_ingredients WHERE ingredient_id = ?',
      [id]
    );
    
    // Luego eliminamos el ingrediente
    const [result] = await db.execute(
      'DELETE FROM active_ingredients WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    
    res.json({ message: 'Ingrediente eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar ingrediente' });
  }
};

// Actualiza el export
module.exports = {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  addIngredientToProduct,
  removeIngredientFromProduct
};