// components/Products/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ProductModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product, 
  ingredients,
  onAddIngredient,
  onRemoveIngredient
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    requires_prescription: false,
    laboratory: '',
    barcode: '',
    expiry_date: '',
    image_url: ''
  });

  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [productIngredients, setProductIngredients] = useState([]);

// En el useEffect que carga los datos del producto
useEffect(() => {
  if (product) {
    console.log('Producto recibido para editar:', product); // Para depuración
    const formattedDate = product.expiry_date 
      ? new Date(product.expiry_date).toISOString().split('T')[0] 
      : '';
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      requires_prescription: product.requires_prescription || false,
      laboratory: product.laboratory || '',
      barcode: product.barcode || '',
      expiry_date: formattedDate, // Usamos la fecha formateada
      image_url: product.image_url || ''
    });
    setProductIngredients(product.ingredients || []);
  } else {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      requires_prescription: false,
      laboratory: '',
      barcode: '',
      expiry_date: '',
      image_url: ''
    });
    setProductIngredients([]);
  }
}, [product, isOpen]); // Añadimos isOpen a las dependencias
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient) {
      Swal.fire('Advertencia', 'Selecciona un ingrediente', 'warning');
      return;
    }
    onAddIngredient(product?.id, selectedIngredient);
    setSelectedIngredient('');
  };

  const handleRemoveIngredient = (ingredientId) => {
    onRemoveIngredient(product?.id, ingredientId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccione...</option>
                  <option value="Medicamento">Medicamento</option>
                  <option value="Suplemento">Suplemento</option>
                  <option value="Cuidado Personal">Cuidado Personal</option>
                  <option value="Equipo Médico">Equipo Médico</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Laboratorio</label>
                <input
                  type="text"
                  name="laboratory"
                  value={formData.laboratory}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_prescription"
                  checked={formData.requires_prescription}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Requiere receta médica</label>
              </div>
            </div>

            {product && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Ingredientes Activos</h3>
                
                <div className="flex mb-3">
                  <select
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="mr-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Seleccionar ingrediente</option>
                    {ingredients.filter(i => !productIngredients.some(pi => pi.id === i.id)).map(ingredient => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.concentration})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    Añadir
                  </button>
                </div>

                <ul className="divide-y divide-gray-200">
                  {productIngredients.map(ingredient => (
                    <li key={ingredient.id} className="py-2 flex justify-between items-center">
                      <span>
                        {ingredient.name} ({ingredient.concentration})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ingredient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                {product ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;