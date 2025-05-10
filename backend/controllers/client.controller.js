const db = require('../config/db');

const getClients = async (req, res) => {
  try {
    let query = 'SELECT * FROM clients';
    const params = [];
    
    if (req.query.search) {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }
    
    const [clients] = await db.execute(query, params);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

const getClientById = async (req, res) => {
  try {
    const [client] = await db.execute(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    );
    
    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(client[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
};

const createClient = async (req, res) => {
  const { first_name, last_name, email, phone, address, rfc } = req.body;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO clients 
       (first_name, last_name, email, phone, address, rfc)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email || null, phone || null, address || null, rfc || null]
    );
    
    res.status(201).json({ 
      message: 'Cliente creado exitosamente',
      id: result.insertId 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    res.status(500).json({ message: 'Error al crear cliente', error: err.message });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, address, rfc } = req.body;
  
  try {
    const [result] = await db.execute(
      `UPDATE clients SET 
       first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, rfc = ?
       WHERE id = ?`,
      [first_name, last_name, email || null, phone || null, address || null, rfc || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    res.status(500).json({ message: 'Error al actualizar cliente', error: err.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute(
      'DELETE FROM clients WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};