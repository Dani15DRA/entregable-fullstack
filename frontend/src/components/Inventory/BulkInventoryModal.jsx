import React, { useState, useEffect } from 'react';
import { getInventory, createBulkInventory } from '../../services/inventoryService';
import { getActiveProductsForSelect } from '../../services/productService';
import Swal from 'sweetalert2';

const BulkInventoryModal = ({ isOpen, onClose, onSubmit, warehouses }) => {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [currentInventory, setCurrentInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          setLoading(true);
          const [productsData, inventoryData] = await Promise.all([
            getActiveProductsForSelect(),
            warehouseId ? getInventory({ warehouse_id: warehouseId }) : Promise.resolve([])
          ]);
          
          setProducts(productsData);
          setCurrentInventory(inventoryData);
          setInventoryItems([]); // Limpiar items al cargar nuevos datos
          setLoading(false);
        } catch (error) {
          console.error('Error loading data:', error);
          Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [isOpen, warehouseId]);

  const handleAddProduct = () => {
    setInventoryItems([...inventoryItems, {
      product_id: '',
      quantity: 1, // Valor por defecto 1 en lugar de 0
      current_stock: 0,
      product_name: '' // Agregamos nombre para mejor manejo
    }]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedItems = [...inventoryItems];
    const productId = field === 'product_id' ? parseInt(value) || '' : updatedItems[index].product_id;
    
    // Verificar si el producto ya está en la lista (excepto el actual)
    if (field === 'product_id' && value && inventoryItems.some(
      (item, i) => i !== index && item.product_id === productId
    )) {
      Swal.fire('Advertencia', 'Este producto ya ha sido agregado', 'warning');
      return;
    }

    // Obtener el nombre del producto si estamos cambiando el ID
    const productName = field === 'product_id' 
      ? products.find(p => p.id === productId)?.name || ''
      : updatedItems[index].product_name;

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'product_id' ? productId : value,
      product_name: productName
    };
    
    // Actualizar current_stock si cambia el producto
    if (field === 'product_id' && value) {
      const inventoryItem = currentInventory.find(i => i.product_id === productId);
      updatedItems[index].current_stock = inventoryItem?.quantity || 0;
    }
    
    setInventoryItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = inventoryItems.filter((_, i) => i !== index);
    setInventoryItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que todos los productos tengan cantidad > 0
    const hasInvalidItems = inventoryItems.some(
      item => !item.product_id || item.quantity <= 0
    );
    
    if (hasInvalidItems) {
      Swal.fire('Error', 'Todos los productos deben tener una cantidad válida', 'error');
      return;
    }

    // Validar productos duplicados (por si acaso)
    const productIds = inventoryItems.map(item => item.product_id);
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
      Swal.fire('Error', 'Hay productos duplicados en la lista', 'error');
      return;
    }
    
     try {
    setLoading(true);
    
    // Preparar datos para enviar
    const itemsToSubmit = inventoryItems.map(item => ({
      product_id: item.product_id,
      quantity: Number(item.quantity),
      min_stock: 0,
      max_stock: null,
      location_in_warehouse: '',
      reason: 'Entrada masiva de inventario'
    }));
    
    // Llamar al servicio
    const response = await createBulkInventory(warehouseId, itemsToSubmit);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al guardar');
    }
    
    Swal.fire('Éxito', 'Inventario actualizado correctamente', 'success');
    
    // Limpiar el formulario
    setInventoryItems([]);
    
    // Recargar datos
    const inventoryData = await getInventory({ warehouse_id: warehouseId });
    setCurrentInventory(inventoryData);
    
    // Cerrar el modal si lo deseas
    // onClose();
  } catch (error) {
    console.error('Error al guardar:', error);
    Swal.fire('Error', error.message || 'No se pudo guardar el inventario', 'error');
  } finally {
    setLoading(false);
  }
};

  // Obtener productos disponibles (no agregados aún)
  const availableProducts = products.filter(
    product => !inventoryItems.some(item => item.product_id === product.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Entrada Múltiple de Inventario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Almacén</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={loading}
            >
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4"
              disabled={availableProducts.length === 0}
            >
              Agregar Producto ({availableProducts.length} disponibles)
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando datos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad a Ingresar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay productos agregados
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.product_id}
                            onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.map(product => (
                              <option 
                                key={product.id} 
                                value={product.id}
                                disabled={inventoryItems.some((item, i) => 
                                  i !== index && item.product_id === product.id
                                )}
                              >
                                {product.name} - {product.barcode || 'Sin código'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.current_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={inventoryItems.length === 0 || loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Todo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkInventoryModal;