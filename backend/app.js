const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const ingredientRoutes = require('./routes/ingredient.routes');
const warehouseRoutes = require('./routes/warehouse.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const movementRoutes = require('./routes/movement.routes');
const clientRoutes = require('./routes/client.routes'); 
const supplierRoutes = require('./routes/supplier.routes');
const saleRoutes = require('./routes/sale.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/ingredients', ingredientRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/movements', movementRoutes);
app.use('/clients', clientRoutes); 
app.use('/suppliers', supplierRoutes);
app.use('/sales', saleRoutes); 
app.use('/dashboard', dashboardRoutes); 
module.exports = app;