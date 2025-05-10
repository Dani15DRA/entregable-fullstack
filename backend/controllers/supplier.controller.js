const db = require('../config/db');

const getSuppliers = async (req, res) => {
  try {
    let query = 'SELECT * FROM suppliers';
    const params = [];
    
    if (req.query.search) {
      query += ' WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ?';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }
    
    const [suppliers] = await db.execute(query, params);
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const [supplier] = await db.execute(
      'SELECT * FROM suppliers WHERE id = ?',
      [req.params.id]
    );
    
    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json(supplier[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el proveedor' });
  }
};

const createSupplier = async (req, res) => {
  const { name, contact_person, email, phone, address, rfc } = req.body;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO suppliers 
       (name, contact_person, email, phone, address, rfc)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, contact_person || null, email || null, phone || null, address || null, rfc || null]
    );
    
    res.status(201).json({ 
      message: 'Proveedor creado exitosamente',
      id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear proveedor', error: err.message });
  }
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_person, email, phone, address, rfc } = req.body;
  
  try {
    const [result] = await db.execute(
      `UPDATE suppliers SET 
       name = ?, contact_person = ?, email = ?, phone = ?, address = ?, rfc = ?
       WHERE id = ?`,
      [name, contact_person || null, email || null, phone || null, address || null, rfc || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar proveedor', error: err.message });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute(
      'DELETE FROM suppliers WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};