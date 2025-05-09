const app = require('./app');
const db = require('./config/db');

db.getConnection()
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});