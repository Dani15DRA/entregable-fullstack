const db = require('../config/db');

// Función auxiliar para manejar transacciones
const withTransaction = async (callback) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Función auxiliar para registrar movimientos (modificada)
const recordMovement = async (connection, data) => {
  await connection.execute(
    `INSERT INTO inventory_movements 
     (product_id, warehouse_id, movement_type, quantity, previous_quantity, 
      new_quantity, user_id, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.product_id || null,
      data.warehouse_id || null,
      data.movement_type || null,
      Math.abs(data.quantity) || 0,
      data.previous_quantity || 0,
      data.new_quantity || 0,
      data.user_id || null,
      data.reason || null
    ]
  );
};

const getInventory = async (req, res) => {
  try {
    let query = `
      SELECT i.*, p.name as product_name, w.name as warehouse_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN warehouses w ON i.warehouse_id = w.id
      WHERE p.is_active = TRUE
    `;
    const params = [];
    
    if (req.query.warehouse_id) {
      query += ' AND i.warehouse_id = ?';
      params.push(req.query.warehouse_id);
    }
    
    if (req.query.product_id) {
      query += ' AND i.product_id = ?';
      params.push(req.query.product_id);
    }
    
    if (req.query.low_stock === 'true') {
      query += ' AND i.quantity <= i.min_stock AND i.min_stock > 0';
    }
    
    const [inventory] = await db.execute(query, params);
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener inventario' });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const [item] = await db.execute(
      `SELECT i.*, p.name as product_name, w.name as warehouse_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       JOIN warehouses w ON i.warehouse_id = w.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    
    if (item.length === 0) {
      return res.status(404).json({ message: 'Ítem no encontrado' });
    }
    
    res.json(item[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el ítem' });
  }
};

const createOrUpdateInventory = async (req, res) => {
  const { product_id, warehouse_id, quantity, min_stock, max_stock, location_in_warehouse } = req.body;
  
  try {
    await withTransaction(async (connection) => {
      // Verificar si ya existe
      const [existing] = await connection.execute(
        'SELECT id, quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?',
        [product_id || null, warehouse_id || null]
      );
      
      if (existing.length > 0) {
        // Actualizar existente
        await connection.execute(
          `UPDATE inventory SET 
           quantity = ?, min_stock = ?, max_stock = ?, location_in_warehouse = ?
           WHERE id = ?`,
          [
            quantity || 0,
            min_stock || 0,
            max_stock || null,
            location_in_warehouse || null,
            existing[0].id
          ]
        );
        
        // Registrar movimiento
        await recordMovement(connection, {
          product_id,
          warehouse_id,
          movement_type: 'Ajuste',
          quantity: quantity - existing[0].quantity,
          previous_quantity: existing[0].quantity,
          new_quantity: quantity,
          user_id: req.user?.id || null, // Usar operador opcional
          reason: 'Ajuste manual de inventario'
        });
      } else {
        // Crear nuevo
        await connection.execute(
          `INSERT INTO inventory 
           (product_id, warehouse_id, quantity, min_stock, max_stock, location_in_warehouse)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            product_id || null,
            warehouse_id || null,
            quantity || 0,
            min_stock || 0,
            max_stock || null,
            location_in_warehouse || null
          ]
        );
        
        // Registrar movimiento
        await recordMovement(connection, {
          product_id,
          warehouse_id,
          movement_type: 'Entrada',
          quantity,
          previous_quantity: 0,
          new_quantity: quantity,
          user_id: req.user?.id || null,
          reason: 'Creación inicial de inventario'
        });
      }
    });
    
    res.status(201).json({ message: 'Inventario actualizado exitosamente' });
  } catch (err) {
    console.error('Error en createOrUpdateInventory:', err);
    res.status(500).json({ 
      message: 'Error al actualizar inventario', 
      error: err.message 
    });
  }
};

const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { quantity, min_stock, max_stock, location_in_warehouse } = req.body;
  
  try {
    await withTransaction(async (connection) => {
      // Obtener datos actuales
      const [current] = await connection.execute(
        'SELECT product_id, warehouse_id, quantity FROM inventory WHERE id = ?',
        [id]
      );
      
      if (current.length === 0) {
        throw new Error('Ítem no encontrado');
      }
      
      // Actualizar
      await connection.execute(
        `UPDATE inventory SET 
         quantity = ?, min_stock = ?, max_stock = ?, location_in_warehouse = ?
         WHERE id = ?`,
        [
          quantity || 0,
          min_stock || 0,
          max_stock || null,
          location_in_warehouse || null,
          id
        ]
      );
      
      // Registrar movimiento
      await recordMovement(connection, {
        product_id: current[0].product_id,
        warehouse_id: current[0].warehouse_id,
        movement_type: 'Ajuste',
        quantity: quantity - current[0].quantity,
        previous_quantity: current[0].quantity,
        new_quantity: quantity,
        user_id: req.user?.id || null,
        reason: 'Ajuste manual de inventario'
      });
    });
    
    res.json({ message: 'Inventario actualizado exitosamente' });
  } catch (err) {
    console.error('Error en updateInventory:', err);
    if (err.message === 'Ítem no encontrado') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ 
      message: 'Error al actualizar inventario', 
      error: err.message 
    });
  }
};

const deleteInventory = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute(
      'DELETE FROM inventory WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ítem no encontrado' });
    }
    
    res.json({ message: 'Ítem eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar ítem' });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createOrUpdateInventory,
  updateInventory,
  deleteInventory
};