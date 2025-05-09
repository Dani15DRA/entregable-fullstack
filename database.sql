CREATE DATABASE IF NOT EXISTS entregable_fullstack;
USE entregable_fullstack;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);


CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
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