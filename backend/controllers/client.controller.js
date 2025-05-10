const db = require('../config/db');

const getClients = async (req, res) => {
  try {
    let query = 'SELECT * FROM clients';
    const params = [];
    
    if (req.query.search) {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR identification_number LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
  const { first_name, last_name, email, phone, address, rfc, identification_type, identification_number } = req.body;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO clients 
       (first_name, last_name, email, phone, address, rfc, identification_type, identification_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, 
        last_name, 
        email || null, 
        phone || null, 
        address || null, 
        rfc || null,
        identification_type || 'DNI', // Valor por defecto si es undefined
        identification_number
      ]
    );
    
    res.status(201).json({ 
      message: 'Cliente creado exitosamente',
      id: result.insertId 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('email')) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      } else if (err.message.includes('identification_number')) {
        return res.status(400).json({ message: 'El número de identificación ya está registrado' });
      }
    }
    res.status(500).json({ message: 'Error al crear cliente', error: err.message });
  }
};
// En el método updateClient
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, address, rfc, identification_type, identification_number } = req.body;
  
  try {
    // Verificar que el nuevo número de identificación no esté en uso
    const [existing] = await db.execute(
      'SELECT id FROM clients WHERE identification_number = ? AND id != ?',
      [identification_number, id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El número de identificación ya está registrado' });
    }

    const [result] = await db.execute(
      `UPDATE clients SET 
       first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, rfc = ?,
       identification_type = ?, identification_number = ?
       WHERE id = ?`,
      [first_name, last_name, email || null, phone || null, address || null, rfc || null,
       identification_type, identification_number, id]
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
    // Primero verificamos si el cliente tiene ventas asociadas
    const [sales] = await db.execute(
      'SELECT COUNT(*) as salesCount FROM sales WHERE client_id = ?',
      [id]
    );

    if (sales[0].salesCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene ventas asociadas' 
      });
    }

    // Si no tiene ventas, procedemos con la eliminación
    const [result] = await db.execute(
      'DELETE FROM clients WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error al eliminar cliente',
      error: err.message 
    });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};