import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import { 
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../../services/inventoryService';
import WarehouseModal from './WarehouseModal';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const warehousesData = await getWarehouses();
      setWarehouses(warehousesData);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los almacenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWarehouseModal = (warehouse = null) => {
    setSelectedWarehouse(warehouse);
    setShowWarehouseModal(true);
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
      fetchWarehouses();
      setShowWarehouseModal(false);
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
        fetchWarehouses();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el almacén', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando almacenes...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Almacenes</h1>
          <button
            onClick={() => handleOpenWarehouseModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Nuevo Almacén
          </button>
        </div>

        {/* Lista de Almacenes */}
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

        {/* Modal para crear/editar almacenes */}
        <WarehouseModal
          isOpen={showWarehouseModal}
          onClose={() => setShowWarehouseModal(false)}
          onSubmit={handleSubmitWarehouse}
          warehouse={selectedWarehouse}
        />
      </div>
    </div>
  );
};

export default WarehouseManagement;