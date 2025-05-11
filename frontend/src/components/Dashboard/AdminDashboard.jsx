import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { 
  getDashboardStats, 
  getSalesChartData, 
  getTopProducts 
} from '../../services/api';
import { 
  FaBoxes, 
  FaDollarSign, 
  FaUsers, 
  FaExclamationTriangle,
  FaChartLine,
  FaShoppingCart
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, salesRes, productsRes] = await Promise.all([
          getDashboardStats(),
          getSalesChartData({ days: daysFilter }),
          getTopProducts({ limit: 5, days: daysFilter })
        ]);
        
        setStats(statsRes.stats);
        setSalesData(salesRes);
        setTopProducts(productsRes);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysFilter]);

  const salesChartData = {
    labels: salesData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Ventas por día',
        data: salesData.map(item => item.sales_count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Ingresos por día',
        data: salesData.map(item => item.sales_total),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ],
  };

  const topProductsData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Cantidad vendida',
        data: topProducts.map(product => product.total_quantity),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas recientes',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de ventas',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Ingresos ($)',
        },
      },
    },
  };

  const productOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Productos más vendidos',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="daysFilter" className="text-sm font-medium text-gray-700">
              Mostrar últimos:
            </label>
            <select
              id="daysFilter"
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="7">7 días</option>
              <option value="30">30 días</option>
              <option value="90">90 días</option>
              <option value="365">1 año</option>
            </select>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FaBoxes className="text-blue-500" size={24} />}
            title="Productos Totales"
            value={stats?.totalProducts}
            description="En inventario"
          />
          <StatCard 
            icon={<FaDollarSign className="text-green-500" size={24} />}
            title="Ventas Hoy"
            value={stats?.todaySales.count}
            secondaryValue={`$${stats?.todaySales.total?.toFixed(2) || '0'}`}
            description="Total acumulado"
          />
          <StatCard 
            icon={<FaUsers className="text-purple-500" size={24} />}
            title="Clientes Registrados"
            value={stats?.totalClients}
            description="En la base de datos"
          />
          <StatCard 
            icon={<FaExclamationTriangle className="text-yellow-500" size={24} />}
            title="Productos con Stock Bajo"
            value={stats?.lowStockProducts}
            description="Necesitan reposición"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Tendencia de Ventas
            </h2>
            <div className="h-64">
              <Line data={salesChartData} options={options} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-purple-500" />
              Productos Más Vendidos
            </h2>
            <div className="h-64">
              <Bar data={topProductsData} options={productOptions} />
            </div>
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Ventas Recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentSales?.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.first_name} {sale.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${sale.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, secondaryValue, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {secondaryValue && (
              <p className="text-sm text-gray-500 mt-1">{secondaryValue}</p>
            )}
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
};

export default AdminDashboard;