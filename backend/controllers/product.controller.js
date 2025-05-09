const db = require('../config/db'); // Asegúrate de tener tu conexión MySQL configurada

// Helper para manejar errores de la base de datos
const handleDbError = (res, err) => {
  console.error('Database error:', err);
  res.status(500).json({ error: 'Error en la base de datos' });
};

// Crear producto (solo admin)
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    category,
    requiresPrescription,
    laboratory,
    barcode,
    expiryDate,
    imageUrl,
    activeIngredients
  } = req.body;

  try {
    // Iniciar transacción
    await db.beginTransaction();

    // 1. Insertar producto principal
    const [productResult] = await db.execute(
      `INSERT INTO products (
        name, description, price, stock, category, 
        requires_prescription, laboratory, barcode, expiry_date, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, price, stock, category,
        requiresPrescription, laboratory, barcode, expiryDate, imageUrl
      ]
    );

    const productId = productResult.insertId;

    // 2. Insertar ingredientes activos si existen
    if (activeIngredients && activeIngredients.length > 0) {
      for (const ingredient of activeIngredients) {
        // Insertar o obtener ID del ingrediente
        const [ingredientResult] = await db.execute(
          `INSERT INTO active_ingredients (name, concentration) 
           VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
          [ingredient.name, ingredient.concentration]
        );

        const ingredientId = ingredientResult.insertId;

        // Relacionar producto con ingrediente
        await db.execute(
          `INSERT INTO product_ingredients (product_id, ingredient_id)
           VALUES (?, ?)`,
          [productId, ingredientId]
        );
      }
    }

    // Commit de la transacción
    await db.commit();

    // Obtener el producto recién creado con sus ingredientes
    const [newProduct] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(ai.name, ' (', ai.concentration, ')') AS ingredients
       FROM products p
       LEFT JOIN product_ingredients pi ON p.id = pi.product_id
       LEFT JOIN active_ingredients ai ON pi.ingredient_id = ai.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [productId]
    );

    res.status(201).json(newProduct[0]);
  } catch (err) {
    await db.rollback();
    handleDbError(res, err);
  }
};

// Obtener todos los productos (público)
exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(ai.name, ' (', ai.concentration, ')')) AS ingredients
FROM products p
LEFT JOIN product_ingredients pi ON p.id = pi.product_id
LEFT JOIN active_ingredients ai ON pi.ingredient_id = ai.id
GROUP BY p.id;
`
    );
    
    // Convertir el string de ingredientes a array
    const formattedProducts = products.map(product => ({
      ...product,
      ingredients: product.ingredients ? product.ingredients.split(',') : []
    }));

    res.json(formattedProducts);
  } catch (err) {
    handleDbError(res, err);
  }
};

// Obtener producto por ID (público)
exports.getProduct = async (req, res) => {
  try {
    const [product] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(ai.name, ' (', ai.concentration, ')')) AS ingredients
    FROM products p
    LEFT JOIN product_ingredients pi ON p.id = pi.product_id
    LEFT JOIN active_ingredients ai ON pi.ingredient_id = ai.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Formatear ingredientes
    const formattedProduct = {
      ...product[0],
      ingredients: product[0].ingredients ? product[0].ingredients.split(',') : []
    };

    res.json(formattedProduct);
  } catch (err) {
    handleDbError(res, err);
  }
};

// Actualizar producto (solo admin)
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const {
    name,
    description,
    price,
    stock,
    category,
    requiresPrescription,
    laboratory,
    barcode,
    expiryDate,
    imageUrl,
    activeIngredients
  } = req.body;

  try {
    await db.beginTransaction();

    // 1. Actualizar producto principal
    await db.execute(
      `UPDATE products SET
        name = ?, description = ?, price = ?, stock = ?, category = ?,
        requires_prescription = ?, laboratory = ?, barcode = ?, expiry_date = ?, image_url = ?
       WHERE id = ?`,
      [
        name, description, price, stock, category,
        requiresPrescription, laboratory, barcode, expiryDate, imageUrl,
        productId
      ]
    );

    // 2. Eliminar relaciones de ingredientes existentes
    await db.execute(
      `DELETE FROM product_ingredients WHERE product_id = ?`,
      [productId]
    );

    // 3. Insertar nuevos ingredientes si existen
    if (activeIngredients && activeIngredients.length > 0) {
      for (const ingredient of activeIngredients) {
        const [ingredientResult] = await db.execute(
          `INSERT INTO active_ingredients (name, concentration) 
           VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
          [ingredient.name, ingredient.concentration]
        );

        const ingredientId = ingredientResult.insertId;

        await db.execute(
          `INSERT INTO product_ingredients (product_id, ingredient_id)
           VALUES (?, ?)`,
          [productId, ingredientId]
        );
      }
    }

    await db.commit();

    // Obtener el producto actualizado
    const [updatedProduct] = await db.execute(
      `SELECT p.*, 
       GROUP_CONCAT(CONCAT(ai.name, ' (', ai.concentration, ')')) AS ingredients
       FROM products p
       LEFT JOIN product_ingredients pi ON p.id = pi.product_id
       LEFT JOIN active_ingredients ai ON pi.ingredient_id = ai.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [productId]
    );

    res.json({
      ...updatedProduct[0],
      ingredients: updatedProduct[0].ingredients ? updatedProduct[0].ingredients.split(',') : []
    });
  } catch (err) {
    await db.rollback();
    handleDbError(res, err);
  }
};

// Eliminar producto (solo admin)
exports.deleteProduct = async (req, res) => {
  try {
    // No necesitamos eliminar manualmente las relaciones por ON DELETE CASCADE
    const [result] = await db.execute(
      `DELETE FROM products WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(204).send();
  } catch (err) {
    handleDbError(res, err);
  }
};