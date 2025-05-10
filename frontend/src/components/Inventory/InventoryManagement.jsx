import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import { 
  getWarehouses,
  createWarehouse,    // Agregar
  updateWarehouse,    // Agregar
  deleteWarehouse,    // Agregar
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getMovements
} from '../../services/inventoryService';
import WarehouseModal from './WarehouseModal';
import InventoryModal from './InventoryModal';
import MovementsModal from './MovementsModal';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warehouse_id: '',
    low_stock: false
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate();
  const [showWarehouses, setShowWarehouses] = useState(false); // Añade este estado

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

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenWarehouseModal = (warehouse = null) => {
    setSelectedWarehouse(warehouse);
    setShowWarehouseModal(true);
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

  const handleSubmitWarehouse = async (warehouseData) => {
    try {
      if (selectedWarehouse) {
        await updateWarehouse(selectedWarehouse.id, warehouseData);
        Swal.fire('Éxito', 'Almacén actualizado correctamente', 'success');
      } else {
        await createWarehouse(warehouseData);
        Swal.fire('Éxito', 'Almacén creado correctamente', 'success');
      }
      fetchData();
      setShowWarehouseModal(false);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
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

  const handleDeleteWarehouse = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await deleteWarehouse(id);
        Swal.fire('Eliminado', 'Almacén eliminado correctamente', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el almacén', 'error');
      }
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
          <div className="space-x-2">
            <button
              onClick={() => handleOpenWarehouseModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Nuevo Almacén
            </button>
            <button
              onClick={() => handleOpenInventoryModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Nuevo Ítem
            </button>
          </div>
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

        {/* Tabs para cambiar entre inventario y almacenes */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${!showWarehouses ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setShowWarehouses(false)}
            >
              Inventario
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${showWarehouses ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setShowWarehouses(true)}
            >
              Almacenes
            </button>
          </nav>
        </div>

        {showWarehouses ? (
          /* Lista de Almacenes */
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warehouses.map(warehouse => (
                  <tr key={warehouse.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                      <div className="text-sm text-gray-500">{warehouse.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {warehouse.is_primary ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sí
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenWarehouseModal(warehouse)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
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
        ) : (
          /* Lista de Inventario */
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
        )}

        {/* Modales */}
        <WarehouseModal
          isOpen={showWarehouseModal}
          onClose={() => setShowWarehouseModal(false)}
          onSubmit={handleSubmitWarehouse}
          warehouse={selectedWarehouse}
        />

        <InventoryModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
          onSubmit={handleSubmitInventory}
          item={selectedItem}
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