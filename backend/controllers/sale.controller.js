const db = require('../config/db');

// Función auxiliar para manejar transacciones
const withTransaction = async (callback) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const recordMovement = async (connection, data) => {
  // Validar que todos los campos requeridos estén presentes
  const requiredFields = [
    'product_id', 'warehouse_id', 'movement_type', 'quantity',
    'previous_quantity', 'new_quantity', 'reference_id',
    'reference_type', 'reason', 'user_id'
  ];
  
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      throw new Error(`Campo requerido faltante en recordMovement: ${field}`);
    }
  }

  await connection.execute(
    `INSERT INTO inventory_movements 
     (product_id, warehouse_id, movement_type, quantity, previous_quantity, 
      new_quantity, reference_id, reference_type, reason, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.product_id,
      data.warehouse_id,
      data.movement_type,
      Math.abs(data.quantity),
      data.previous_quantity,
      data.new_quantity,
      data.reference_id,
      data.reference_type,
      data.reason,
      data.user_id
    ]
  );
};
const createSale = async (req, res) => {
  try {
    const { client_id, items, payment_method, notes, warehouse_id = 1 } = req.body;
    const user_id = req.user.id;

    // Validar que client_id no sea undefined (puede ser null para ventas sin cliente)
    if (client_id === undefined) {
      throw new Error('El campo client_id no puede ser undefined, usa null para ventas sin cliente');
    }

    // Validar que los items no estén vacíos
    if (!items || items.length === 0) {
      throw new Error('Debe incluir al menos un producto en la venta');
    }

    await withTransaction(async (connection) => {
      // 1. Calcular totales
      let subtotal = 0;
      const productIds = items.map(i => i.product_id);
      const productPlaceholders = items.map(() => '?').join(',');
      
      const [products] = await connection.execute(
        `SELECT id, price, name FROM products WHERE id IN (${productPlaceholders})`,
        productIds
      );

      if (products.length !== items.length) {
        const missingIds = items.filter(item => 
          !products.some(p => p.id === item.product_id)
        ).map(item => item.product_id);
        throw new Error(`Productos no encontrados: ${missingIds.join(', ')}`);
      }

      const itemsWithPrices = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const unit_price = product.price;
        const total_price = unit_price * item.quantity;
        subtotal += total_price;
        
        return {
          ...item,
          unit_price,
          total_price
        };
      });

      const tax = subtotal * 0.16; // IVA 16%
      const total = subtotal + tax;

      // 2. Crear la venta - Asegurar que todos los valores estén definidos
      const [saleResult] = await connection.execute(
        `INSERT INTO sales 
         (client_id, user_id, subtotal, tax, total, payment_method, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          client_id || null, // Convertir undefined a null
          user_id,
          subtotal,
          tax,
          total,
          payment_method,
          notes || null // Convertir undefined a null
        ]
      );
      const saleId = saleResult.insertId;

      // 3. Crear detalles de venta - Validar cada campo
      const saleDetailsValues = itemsWithPrices.map(item => [
        saleId, 
        item.product_id, 
        item.quantity, 
        item.unit_price, 
        item.total_price
      ]);

      // Validar que no haya valores undefined en los detalles
      if (saleDetailsValues.some(arr => arr.some(val => val === undefined))) {
        throw new Error('Uno o más valores en los detalles de venta son undefined');
      }

      await connection.query(
        `INSERT INTO sale_details 
        (sale_id, product_id, quantity, unit_price, total_price)
        VALUES ?`,
        [saleDetailsValues]
      );

      // 4. Actualizar inventario y registrar movimientos
      for (const item of itemsWithPrices) {
        // Obtener inventario actual
        const [inventory] = await connection.execute(
          'SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE',
          [item.product_id, warehouse_id]
        );

        if (inventory.length === 0) {
          throw new Error(`Inventario no encontrado para producto ${item.product_id}`);
        }

        const previousQuantity = inventory[0].quantity;
        const newQuantity = previousQuantity - item.quantity;

        if (newQuantity < 0) {
          throw new Error(`Stock insuficiente para producto ${item.product_id}. Disponible: ${previousQuantity}, Solicitado: ${item.quantity}`);
        }

        // Actualizar inventario
        await connection.execute(
          'UPDATE inventory SET quantity = ? WHERE product_id = ? AND warehouse_id = ?',
          [newQuantity, item.product_id, warehouse_id]
        );

        // Registrar movimiento - Asegurar que todos los campos estén definidos
        await recordMovement(connection, {
          product_id: item.product_id,
          warehouse_id: warehouse_id,
          movement_type: 'Salida',
          quantity: item.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reference_id: saleId,
          reference_type: 'sale',
          reason: `Venta #${saleId}`,
          user_id: user_id
        });
      }

      // 5. Obtener venta completa para respuesta
      const [sale] = await connection.execute(
        `SELECT s.*, 
                c.first_name as client_first_name, 
                c.last_name as client_last_name,
                u.username as user_username
         FROM sales s
         LEFT JOIN clients c ON s.client_id = c.id
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
        [saleId]
      );

      const [saleDetails] = await connection.execute(
        `SELECT sd.*, p.name as product_name
         FROM sale_details sd
         JOIN products p ON sd.product_id = p.id
         WHERE sd.sale_id = ?`,
        [saleId]
      );

      res.status(201).json({
        ...sale[0],
        details: saleDetails
      });
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(400).json({ 
      error: 'Error al procesar la venta',
      message: error.message 
    });
  }
};

// Obtener todas las ventas
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, status, client_id } = req.query;
    let query = `
      SELECT s.*, 
             c.first_name as client_first_name, 
             c.last_name as client_last_name,
                       c.identification_type as client_identification_type,
          c.identification_number as client_identification_number,
             u.username as user_username
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      JOIN users u ON s.user_id = u.id
    `;
    const params = [];
    let whereAdded = false;

    if (startDate && endDate) {
      query += ` WHERE s.sale_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
      whereAdded = true;
    }

    if (status) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ' s.status = ?';
      params.push(status);
      whereAdded = true;
    }

    if (client_id) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ' s.client_id = ?';
      params.push(client_id);
    }

    query += ' ORDER BY s.sale_date DESC';

     const [sales] = await db.execute(query, params);

    // Obtener detalles para cada venta
    const salesWithDetails = await Promise.all(
      sales.map(async sale => {
        const [details] = await db.execute(
          `SELECT sd.*, p.name as product_name
           FROM sale_details sd
           JOIN products p ON sd.product_id = p.id
           WHERE sd.sale_id = ?`,
          [sale.id]
        );
        return { ...sale, details };
      })
    );

    res.json(salesWithDetails);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

// Obtener una venta por ID
const getSaleById = async (req, res) => {
  try {
    const [sale] = await db.execute(
      `SELECT s.*, 
              c.first_name as client_first_name, 
              c.last_name as client_last_name,
                                     c.identification_type as client_identification_type,
          c.identification_number as client_identification_number,
              u.username as user_username
       FROM sales s
       LEFT JOIN clients c ON s.client_id = c.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (sale.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const [details] = await db.execute(
      `SELECT sd.*, p.name as product_name
       FROM sale_details sd
       JOIN products p ON sd.product_id = p.id
       WHERE sd.sale_id = ?`,
      [req.params.id]
    );

    res.json({
      ...sale[0],
      details
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// Cancelar una venta (devolver stock)
const cancelSale = async (req, res) => {
  try {
    await withTransaction(async (connection) => {
      // 1. Obtener la venta
      const [sale] = await connection.execute(
        'SELECT * FROM sales WHERE id = ? AND status = "Activo" FOR UPDATE',
        [req.params.id]
      );

      if (sale.length === 0) {
        throw new Error('Venta no encontrada o ya Anulado');
      }

      // 2. Obtener detalles de la venta
      const [details] = await connection.execute(
        'SELECT * FROM sale_details WHERE sale_id = ?',
        [req.params.id]
      );

      // 3. Devolver stock y registrar movimientos
      for (const item of details) {
        // Obtener inventario actual
        const [inventory] = await connection.execute(
          `SELECT i.quantity, i.warehouse_id 
           FROM inventory i
           WHERE i.product_id = ? FOR UPDATE`,
          [item.product_id]
        );

        if (inventory.length === 0) {
          console.warn(`Producto ${item.product_id} no encontrado en inventario al cancelar venta`);
          continue;
        }

        const warehouse_id = inventory[0].warehouse_id;
        const previousQuantity = inventory[0].quantity;
        const newQuantity = previousQuantity + item.quantity;

        // Actualizar inventario
        await connection.execute(
          'UPDATE inventory SET quantity = ? WHERE product_id = ? AND warehouse_id = ?',
          [newQuantity, item.product_id, warehouse_id]
        );

        // Registrar movimiento
        await recordMovement(connection, {
          product_id: item.product_id,
          warehouse_id,
          movement_type: 'Entrada',
          quantity: item.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reference_id: req.params.id,
          reference_type: 'sale_cancel',
          reason: `Cancelación de venta #${req.params.id}`,
          user_id: req.user.id
        });
      }

      // 4. Marcar venta como Anulado
      await connection.execute(
        'UPDATE sales SET status = "Anulado" WHERE id = ?',
        [req.params.id]
      );

      res.json({ message: 'Venta Anulado exitosamente' });
    });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ 
      error: 'Error al cancelar la venta',
      message: error.message 
    });
  }
};

// Agrega esta función en tu salesController.js
const searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT p.id, p.name, p.price, p.description, p.code,
             c.name as category_name,
             i.quantity as stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.name LIKE ? OR c.name LIKE ? OR p.code LIKE ?
      GROUP BY p.id
    `;
    
    const searchTerm = `%${search}%`;
    const [products] = await db.execute(query, [searchTerm, searchTerm, searchTerm]);
    
    res.json(products);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
};
module.exports = {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  searchProducts 
};