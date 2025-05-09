const bcrypt = require('bcryptjs');
const db = require('../config/db');

const createUser = async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role || 'user']
    );
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, role } = req.body;

  try {
    let query = 'UPDATE users SET email = ?, role = ?';
    let params = [email, role];

    // Si se proporciona una nueva contraseña, la hasheamos
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser, 
};