import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  getIngredients, 
  createIngredient, 
  updateIngredient,
  deleteIngredient 
} from '../../services/productService';
import IngredientModal from './IngredientModal';
import Navbar from '../Navbar';

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los ingredientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ingredient = null) => {
    setCurrentIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentIngredient(null);
  };

  const handleSubmit = async (ingredientData) => {
    try {
      if (currentIngredient) {
        await updateIngredient(currentIngredient.id, ingredientData);
        Swal.fire('Éxito', 'Ingrediente actualizado correctamente', 'success');
      } else {
        await createIngredient(ingredientData);
        Swal.fire('Éxito', 'Ingrediente creado correctamente', 'success');
      }
      fetchIngredients();
      handleCloseModal();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar el ingrediente', 'error');
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
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteIngredient(id);
        Swal.fire('Eliminado', 'El ingrediente ha sido eliminado', 'success');
        fetchIngredients();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el ingrediente', 'error');
      }
    }
  };
  if (loading) return <div className="text-center py-8">Cargando ingredientes...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Ingredientes Activos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Nuevo Ingrediente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concentración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.concentration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                  onClick={() => handleOpenModal(ingredient)}
                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(ingredient.id)}
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

      <IngredientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        ingredient={currentIngredient}
      />
    </div>
    </div>
  );
};

export default IngredientManagement;