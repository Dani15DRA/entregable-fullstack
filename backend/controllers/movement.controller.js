const db = require('../config/db');

const getMovements = async (req, res) => {
  try {
    let query = `
      SELECT m.*, 
             p.name as product_name, 
             w.name as warehouse_name,
             u.username as user_name
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN warehouses w ON m.warehouse_id = w.id
      JOIN users u ON m.user_id = u.id
    `;
    const params = [];
    
    if (req.query.product_id) {
      query += ' WHERE m.product_id = ?';
      params.push(req.query.product_id);
    }
    
    if (req.query.warehouse_id) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' m.warehouse_id = ?';
      params.push(req.query.warehouse_id);
    }
    
    if (req.query.movement_type) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' m.movement_type = ?';
      params.push(req.query.movement_type);
    }
    
    if (req.query.date_from) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' m.movement_date >= ?';
      params.push(req.query.date_from);
    }
    
    if (req.query.date_to) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' m.movement_date <= ?';
      params.push(req.query.date_to);
    }
    
    query += ' ORDER BY m.movement_date DESC';
    
    const [movements] = await db.execute(query, params);
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

const getMovementById = async (req, res) => {
  try {
    const [movement] = await db.execute(
      `SELECT m.*, 
              p.name as product_name, 
              w.name as warehouse_name,
              u.username as user_name
       FROM inventory_movements m
       JOIN products p ON m.product_id = p.id
       JOIN warehouses w ON m.warehouse_id = w.id
       JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    
    if (movement.length === 0) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    
    res.json(movement[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el movimiento' });
  }
};

module.exports = {
  getMovements,
  getMovementById
};