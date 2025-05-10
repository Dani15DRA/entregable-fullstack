// components/Products/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el producto', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (!product) return <div className="text-center py-8">Producto no encontrado</div>;

  return (
            <div className="min-h-screen bg-gray-50">
      <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {product.image_url && (
            <div className="md:w-1/3">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          <div className="md:w-2/3">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Precio</h3>
                <p className="text-lg font-semibold">${product.price}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                <p className="capitalize">{product.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Laboratorio</h3>
                <p>{product.laboratory}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requiere receta</h3>
                <p>{product.requires_prescription ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingredientes Activos</h3>
                <ul className="divide-y divide-gray-200">
                  {product.ingredients.map(ingredient => (
                    <li key={ingredient.id} className="py-2">
                      <p className="font-medium">{ingredient.name}</p>
                      <p className="text-sm text-gray-500">{ingredient.concentration}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProductDetail;