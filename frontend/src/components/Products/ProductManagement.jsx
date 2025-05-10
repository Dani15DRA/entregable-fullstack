import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';


import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getIngredients,
  addIngredientToProduct,
  removeIngredientFromProduct
} from '../../services/productService';
import ProductModal from './ProductModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  });
  const [ingredients, setIngredients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchIngredients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const applyFilters = () => {
    let result = [...products];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm))
    }
    
    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }
    
    setFilteredProducts(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (productData) => {
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productData);
        Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
      } else {
        await createProduct(productData);
        Swal.fire('Éxito', 'Producto creado correctamente', 'success');
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar el producto', 'error');
    }
  };

  const handleDelete = async (id) => {
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
        await deleteProduct(id);
        Swal.fire('Eliminado', 'El producto ha sido eliminado', 'success');
        fetchProducts();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleAddIngredient = async (productId, ingredientId) => {
    try {
      await addIngredientToProduct(productId, ingredientId);
      Swal.fire('Éxito', 'Ingrediente añadido correctamente', 'success');
      fetchProducts();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al añadir ingrediente', 'error');
    }
  };

  const handleRemoveIngredient = async (productId, ingredientId) => {
    try {
      await removeIngredientFromProduct(productId, ingredientId);
      Swal.fire('Éxito', 'Ingrediente removido correctamente', 'success');
      fetchProducts();
    } catch (error) {
      Swal.fire('Error', 'Error al remover ingrediente', 'error');
    }
  };

  if (loading) return <div className="text-center py-8">Cargando productos...</div>;

  return (
        <div className="min-h-screen bg-gray-50">
      <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Todas</option>
              <option value="Medicamento">Medicamento</option>
                  <option value="Suplemento">Suplemento</option>
                  <option value="Cuidado Personal">Cuidado Personal</option>
                  <option value="Equipo Médico">Equipo Médico</option>
                  <option value="Otros">Otros</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laboratorio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.image_url && (
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={product.image_url} alt={product.name} />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.laboratory}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        product={currentProduct}
        ingredients={ingredients}
        onAddIngredient={handleAddIngredient}
        onRemoveIngredient={handleRemoveIngredient}
      />
    </div>
    </div>
  );
};

export default ProductManagement;