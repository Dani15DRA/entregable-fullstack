const db = require('../config/db');

const createWarehouse = async (req, res) => {
  const { name, location, description, is_primary } = req.body;
  
  try {
    // Verificar campos requeridos
    if (!name || !location) {
      return res.status(400).json({ 
        message: 'Nombre y ubicación son campos requeridos' 
      });
    }

    // Verificar si ya existe un almacén primario
    if (is_primary) {
      const [primary] = await db.execute(
        'SELECT id FROM warehouses WHERE is_primary = TRUE'
      );
      if (primary.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe un almacén principal',
          existingPrimary: primary[0].id 
        });
      }
    }

    const [result] = await db.execute(
      'INSERT INTO warehouses (name, location, description, is_primary) VALUES (?, ?, ?, ?)',
      [name, location, description, is_primary || false]
    );
    
    res.status(201).json({ 
      message: 'Almacén creado exitosamente',
      warehouseId: result.insertId 
    });
  } catch (err) {
    console.error('Error detallado:', err);
    res.status(500).json({ 
      message: 'Error al crear almacén', 
      error: err.message,
      sqlError: err.sqlMessage // Esto mostrará el mensaje específico de MySQL
    });
  }
};

const getWarehouses = async (req, res) => {
  try {
    const [warehouses] = await db.execute('SELECT * FROM warehouses');
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener almacenes' });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const [warehouse] = await db.execute(
      'SELECT * FROM warehouses WHERE id = ?', 
      [req.params.id]
    );
    
    if (warehouse.length === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json(warehouse[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el almacén' });
  }
};

const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, location, description, is_primary } = req.body;
  
  try {
    // Verificar si se está intentando hacer primario
    if (is_primary) {
      const [primary] = await db.execute(
        'SELECT id FROM warehouses WHERE is_primary = TRUE AND id != ?',
        [id]
      );
      if (primary.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe otro almacén principal' 
        });
      }
    }

    const [result] = await db.execute(
      `UPDATE warehouses SET 
       name = ?, location = ?, description = ?, is_primary = ?
       WHERE id = ?`,
      [name, location, description, is_primary || false, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({ message: 'Almacén actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar almacén' });
  }
};

const deleteWarehouse = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si tiene inventario asociado
    const [inventory] = await db.execute(
      'SELECT id FROM inventory WHERE warehouse_id = ? LIMIT 1',
      [id]
    );
    
    if (inventory.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar, tiene inventario asociado' 
      });
    }

    const [result] = await db.execute(
      'DELETE FROM warehouses WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({ message: 'Almacén eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar almacén' });
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
};