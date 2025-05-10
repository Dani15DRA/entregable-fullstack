import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Users
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};


// Productos
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
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

export const addIngredientToProduct = async (productId, ingredientId) => {
  const response = await api.post(`/products/${productId}/ingredients`, { ingredientId });
  return response.data;
};

export const removeIngredientFromProduct = async (productId, ingredientId) => {
  const response = await api.delete(`/products/${productId}/ingredients/${ingredientId}`);
  return response.data;
};

export default api;