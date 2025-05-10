CREATE DATABASE IF NOT EXISTS entregable_fullstack;
USE entregable_fullstack;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255)  NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  category ENUM('Medicamento', 'Cuidado Personal', 'Suplemento', 'Equipo Médico', 'Otros') NOT NULL,
  requires_prescription BOOLEAN DEFAULT FALSE,
  laboratory VARCHAR(100),
  barcode VARCHAR(50) UNIQUE,
  expiry_date DATE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para ingredientes activos (relación muchos a muchos)
CREATE TABLE active_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  concentration VARCHAR(50)
);

-- Tabla intermedia para relación productos-ingredientes
CREATE TABLE product_ingredients (
  product_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  PRIMARY KEY (product_id, ingredient_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES active_ingredients(id) ON DELETE CASCADE
);



-- Tabla de Clientes
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  rfc VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Ventas
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  user_id INT NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('Efectivo', 'Tarjeta Crédito', 'Tarjeta Débito', 'Transferencia') NOT NULL,
  status ENUM('Pendiente', 'Completada', 'Cancelada') DEFAULT 'Completada',
  prescription_required BOOLEAN DEFAULT FALSE,
  prescription_details TEXT,
  notes TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Detalles de Venta
CREATE TABLE sale_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabla de Almacenes
CREATE TABLE warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Stock (inventario por almacén)
CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INT DEFAULT 0,
  max_stock INT,
  location_in_warehouse VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (product_id, warehouse_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- Tabla de Movimientos de Inventario
CREATE TABLE inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  movement_type ENUM('Entrada', 'Salida', 'Ajuste', 'Transferencia') NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_id INT, -- Puede ser ID de venta, compra, etc.
  reference_type VARCHAR(50), -- 'sale', 'purchase', 'adjustment', etc.
  reason VARCHAR(255),
  user_id INT NOT NULL,
  movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Proveedores (necesaria para gestionar entradas de inventario)
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  rfc VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Compras (para registrar entradas de productos)
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  invoice_number VARCHAR(50),
  purchase_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('Pendiente', 'Recibido', 'Cancelado') DEFAULT 'Pendiente',
  user_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Detalles de Compra
CREATE TABLE purchase_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  expiry_date DATE,
  batch_number VARCHAR(50),
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);


USE entregable_fullstack;

-- Agregar columna para tipo de identificación
ALTER TABLE clients 
ADD COLUMNs identification_type ENUM('DNI', 'RUC', 'Pasaporte', 'Carnet Extranjería', 'Otro') NOT NULL DEFAULT 'DNI' AFTER rfc;

-- Agregar columna para número de identificación (primero permitiendo nulos)
ALTER TABLE clients 
ADD COLUMN identification_number VARCHAR(20) NULL AFTER identification_type;

-- Cambiar a NOT NULL ahora que todos los registros tienen valor
ALTER TABLE clients 
MODIFY COLUMN identification_number VARCHAR(20) NOT NULL;

-- Agregar índice único
ALTER TABLE clients 
ADD UNIQUE INDEX identification_number_unique (identification_number);