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

module.exports = {
  createUser,
  getUsers
};