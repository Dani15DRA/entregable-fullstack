// middlewares/stock.middleware.js
const db = require('../config/db');

const checkStock = async (req, res, next) => {
  try {
    const { items, warehouse_id = 1 } = req.body;
    
    // Verificar stock para cada producto
    for (const item of items) {
      const [inventory] = await db.execute(
        `SELECT i.quantity, p.name 
         FROM inventory i
         JOIN products p ON i.product_id = p.id
         WHERE i.product_id = ? AND i.warehouse_id = ?`,
        [item.product_id, warehouse_id]
      );
      
      if (inventory.length === 0) {
        return res.status(400).json({ 
          error: `Producto con ID ${item.product_id} no existe en el inventario del almacén ${warehouse_id}` 
        });
      }
      
      if (inventory[0].quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${inventory[0].name}. Disponible: ${inventory[0].quantity}, Solicitado: ${item.quantity}` 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en checkStock middleware:', error);
    res.status(500).json({ error: 'Error al verificar el stock' });
  }
};

module.exports = { checkStock };