// Solo para pruebas: crea un usuario con password hasheado
const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function crearUsuario() {
  const hashed = await bcrypt.hash('123456', 10);
  await db.execute(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    ['testuser', 'test@example.com', hashed]
  );
  console.log('Usuario creado');
}
crearUsuario();
