const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [[user]] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  login
};