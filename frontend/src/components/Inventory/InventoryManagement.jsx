import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import { 
  getWarehouses,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getMovements
} from '../../services/inventoryService';
import InventoryModal from './InventoryModal';
import MovementsModal from './MovementsModal';
import BulkInventoryModal from './BulkInventoryModal';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warehouse_id: '',
    low_stock: false
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate();
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, warehousesData] = await Promise.all([
        getInventory(filters),
        getWarehouses()
      ]);
      setInventory(inventoryData);
      setWarehouses(warehousesData);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };
const handleBulkSubmit = async (warehouseId, items) => {
    try {
      await createBulkInventory(warehouseId, items);
      Swal.fire('Éxito', 'Inventario actualizado correctamente', 'success');
      fetchData();
      setShowBulkModal(false);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
    }
  };
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenInventoryModal = (item = null) => {
    setSelectedItem(item);
    setShowInventoryModal(true);
  };

  const handleOpenMovementsModal = async (productId, warehouseId) => {
    try {
      const movementsData = await getMovements({ 
        product_id: productId, 
        warehouse_id: warehouseId 
      });
      setMovements(movementsData);
      setShowMovementsModal(true);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error');
    }
  };

  const handleSubmitInventory = async (inventoryData) => {
    try {
      if (selectedItem) {
        await updateInventoryItem(selectedItem.id, inventoryData);
        Swal.fire('Éxito', 'Inventario actualizado correctamente', 'success');
      } else {
        await createInventoryItem(inventoryData);
        Swal.fire('Éxito', 'Ítem de inventario creado', 'success');
      }
      fetchData();
      setShowInventoryModal(false);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleDeleteInventory = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await deleteInventoryItem(id);
        Swal.fire('Eliminado', 'Ítem eliminado correctamente', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el ítem', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando inventario...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Inventario</h1>
                    <button
            onClick={() => setShowBulkModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Entrada Múltiple
          </button>
          <button
            onClick={() => handleOpenInventoryModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nuevo Ítem
          </button>
          
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Almacén</label>
              <select
                name="warehouse_id"
                value={filters.warehouse_id}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Todos</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="low_stock"
                checked={filters.low_stock}
                onChange={handleFilterChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Mostrar solo bajo stock</label>
            </div>
          </div>
        </div>

        {/* Lista de Inventario */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacén</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mín/Máx</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map(item => (
                <tr key={item.id} className={item.quantity <= item.min_stock ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.quantity <= item.min_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.min_stock || 0} / {item.max_stock || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location_in_warehouse}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenMovementsModal(item.product_id, item.warehouse_id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Movimientos
                    </button>
                    <button
                      onClick={() => handleOpenInventoryModal(item)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteInventory(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modales */}
        <InventoryModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
          onSubmit={handleSubmitInventory}
          item={selectedItem}
          warehouses={warehouses}
        />
      <BulkInventoryModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkSubmit}
        warehouses={warehouses}
      />
        <MovementsModal
          isOpen={showMovementsModal}
          onClose={() => setShowMovementsModal(false)}
          movements={movements}
        />
      </div>
    </div>
  );
};

export default InventoryManagement;