import api from './api';

// Productos
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data || []; // Asegura que siempre retorne un array
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // Retorna array vacío en caso de error
  }
};

export const getActiveProductsForSelect = async () => {
  try {
    const response = await api.get('/products/active-select');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products for select:', error);
    return [];
  }
};
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Ingredientes
export const getIngredients = async () => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const createIngredient = async (ingredientData) => {
  const response = await api.post('/ingredients', ingredientData);
  return response.data;
};

export const updateIngredient = async (id, ingredientData) => {
  const response = await api.put(`/ingredients/${id}`, ingredientData);
  return response.data;
};

export const deleteIngredient = async (id) => {
  const response = await api.delete(`/ingredients/${id}`);
  return response.data;
};

export const addIngredientToProduct = async (productId, ingredientId) => {
  const response = await api.post(`/ingredients/${productId}/ingredients`, { ingredientId });
  return response.data;
};

export const removeIngredientFromProduct = async (productId, ingredientId) => {
  const response = await api.delete(`/ingredients/${productId}/ingredients/${ingredientId}`);
  return response.data;
};