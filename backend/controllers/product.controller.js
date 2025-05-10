const db = require('../config/db');

// Listar productos con filtros
const getProducts = async (req, res) => {
  try {
    let query = 'SELECT * FROM products WHERE is_active = TRUE';
    const params = [];
    
    // Filtros
    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    
    if (req.query.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    
    const [products] = await db.execute(query, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Obtener detalles de un producto
const getProductById = async (req, res) => {
  try {
    const [product] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND is_active = TRUE', 
      [req.params.id]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    

    // Obtener ingredientes del producto
    const [ingredients] = await db.execute(
      `SELECT ai.id, ai.name, ai.concentration 
       FROM active_ingredients ai
       JOIN product_ingredients pi ON ai.id = pi.ingredient_id
       WHERE pi.product_id = ?`,
      [req.params.id]
    );
    
    res.json({ ...product[0], ingredients });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

// Crear nuevo producto
const createProduct = async (req, res) => {
  const { name, description, price, category, requires_prescription, laboratory, barcode, expiry_date, image_url } = req.body;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO products 
       (name, description, price, category, requires_prescription, laboratory, barcode, expiry_date, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, requires_prescription || false, laboratory, barcode, expiry_date, image_url]
    );
    
    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      productId: result.insertId 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El código de barras ya existe' });
    }
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// Actualizar producto
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, requires_prescription, laboratory, barcode, expiry_date, image_url } = req.body;
  
  try {
    // Convertir la fecha si viene en formato ISO (puede ser necesario)
    const formattedExpiryDate = expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : null;

    const [result] = await db.execute(
      `UPDATE products SET 
       name = ?, description = ?, price = ?, category = ?, 
       requires_prescription = ?, laboratory = ?, barcode = ?, 
       expiry_date = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, 
        description, 
        price, 
        category, 
        requires_prescription || false, 
        laboratory, 
        barcode, 
        formattedExpiryDate, // Usamos la fecha formateada
        image_url, 
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Devolver el producto actualizado
    const [updatedProduct] = await db.execute(
      'SELECT * FROM products WHERE id = ?', 
      [id]
    );
    
    res.json({ 
      message: 'Producto actualizado exitosamente',
      product: updatedProduct[0] 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El código de barras ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
  }
};

// Desactivar producto (borrado lógico)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute(
      'UPDATE products SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto desactivado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al desactivar producto' });
  }
};

// Obtener productos activos simplificados (para selects)
const getActiveProductsForSelect = async (req, res) => {
  try {
    // Consulta optimizada para selects, solo campos necesarios
    const [products] = await db.execute(`
      SELECT 
        id, 
        name, 
        barcode,
        category
      FROM products 
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);
    
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos para select:', err);
    res.status(500).json({ 
      message: 'Error al obtener productos',
      error: err.message 
    });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getActiveProductsForSelect 
};