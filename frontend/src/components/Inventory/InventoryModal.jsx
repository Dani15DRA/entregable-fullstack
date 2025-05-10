import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getActiveProductsForSelect } from '../../services/productService';

const InventoryModal = ({ isOpen, onClose, onSubmit, item, warehouses }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 0,
    min_stock: 0,
    max_stock: '',
    location_in_warehouse: ''
  });

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getActiveProductsForSelect();
        setProducts(productsData);
        setLoadingProducts(false);
        
        // Inicializar el formulario después de cargar los productos
        initializeForm(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setLoadingProducts(false);
      }
    };

    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]); // Solo dependemos de isOpen para evitar recargas innecesarias

  const initializeForm = (productsData) => {
    if (item) {
      // Modo edición
      setFormData({
        product_id: item.product_id || '',
        warehouse_id: item.warehouse_id || '',
        quantity: item.quantity || 0,
        min_stock: item.min_stock || 0,
        max_stock: item.max_stock || '',
        location_in_warehouse: item.location_in_warehouse || ''
      });
    } else {
      // Modo creación
      setFormData({
        product_id: productsData.length > 0 ? productsData[0].id : '',
        warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
        quantity: 0,
        min_stock: 0,
        max_stock: '',
        location_in_warehouse: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validación y normalización de datos
  const payload = {
    product_id: formData.product_id || null,
    warehouse_id: formData.warehouse_id || null,
    quantity: parseInt(formData.quantity) || 0,
    min_stock: parseInt(formData.min_stock) || 0,
    max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
    location_in_warehouse: formData.location_in_warehouse || null
  };

  onSubmit(payload);
};

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {item ? 'Editar Inventario' : 'Nuevo Ítem de Inventario'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Producto</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!!item} // Deshabilitar si estamos editando
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.barcode || 'Sin código'}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Almacén</label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar almacén</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mínimo</label>
                <input
                  type="number"
                  name="min_stock"
                  min="0"
                  value={formData.min_stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Máximo</label>
                <input
                  type="number"
                  name="max_stock"
                  min="0"
                  value={formData.max_stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Ubicación en almacén</label>
              <input
                type="text"
                name="location_in_warehouse"
                value={formData.location_in_warehouse}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {item ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;