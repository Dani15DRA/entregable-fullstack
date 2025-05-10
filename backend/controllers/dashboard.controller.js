// controllers/dashboard.controller.js
const db = require('../config/db');

// Estadísticas generales
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [
      [totalProducts],
      [activeProducts],
      [todaySales],
      [monthSales],
      [lowStockProducts],
      [totalClients],
      [recentSales]
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM products'),
      db.execute('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'),
      db.execute('SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE DATE(sale_date) = ?', [today]),
      db.execute('SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURRENT_DATE()) AND YEAR(sale_date) = YEAR(CURRENT_DATE())'),
      db.execute('SELECT COUNT(*) as count FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.quantity <= i.min_stock AND p.is_active = TRUE'),
      db.execute('SELECT COUNT(*) as count FROM clients'),
      db.execute('SELECT s.id, s.total, s.sale_date, c.first_name, c.last_name FROM sales s LEFT JOIN clients c ON s.client_id = c.id ORDER BY s.sale_date DESC LIMIT 5')
    ]);

    res.json({
      stats: {
        totalProducts: totalProducts[0].count,
        activeProducts: activeProducts[0].count,
        todaySales: {
          count: todaySales[0].count || 0,
          total: todaySales[0].total || 0
        },
        monthSales: {
          count: monthSales[0].count || 0,
          total: monthSales[0].total || 0
        },
        lowStockProducts: lowStockProducts[0].count,
        totalClients: totalClients[0].count
      },
      recentSales: recentSales
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
  }
};

// Gráfico de ventas por día
const getSalesChartData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [salesData] = await db.execute(`
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        SUM(total) as sales_total
      FROM sales
      WHERE sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY DATE(sale_date)
      ORDER BY DATE(sale_date)
    `, [days]);
    
    res.json(salesData);
  } catch (err) {
    console.error('Error al obtener datos para gráfico:', err);
    res.status(500).json({ message: 'Error al obtener datos para gráfico' });
  }
};

// Productos más vendidos
const getTopProducts = async (req, res) => {
  try {
    const { limit = 5, days } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(sd.quantity) as total_quantity,
        SUM(sd.total_price) as total_sales
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.id
      JOIN sales s ON sd.sale_id = s.id
    `;
    
    const params = [];
    
    if (days) {
      query += ' WHERE s.sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)';
      params.push(days);
    }
    
    query += `
      GROUP BY p.id
      ORDER BY total_quantity DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));
    
    const [topProducts] = await db.execute(query, params);
    res.json(topProducts);
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err);
    res.status(500).json({ message: 'Error al obtener productos más vendidos' });
  }
};

module.exports = {
  getDashboardStats,
  getSalesChartData,
  getTopProducts
};