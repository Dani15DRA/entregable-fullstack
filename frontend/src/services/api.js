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

// Clientes
export const getClients = async (search = '') => {
  const response = await api.get('/clients', { params: { search } });
  return response.data;
};

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  const response = await api.put(`/clients/${id}`, clientData);
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

// Proveedores
export const getSuppliers = async (search = '') => {
  const response = await api.get('/suppliers', { params: { search } });
  return response.data;
};

export const getSupplierById = async (id) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (supplierData) => {
  const response = await api.post('/suppliers', supplierData);
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  const response = await api.put(`/suppliers/${id}`, supplierData);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

//VENTAS

export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const getSales = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/sales?${params.toString()}`);
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const cancelSale = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return response.data;
};

// Agrega esta función a tu archivo api.js
export const getProductStock = async (productId) => {
  const response = await api.get(`/inventory?product_id=${productId}`);
  return response.data.length > 0 ? response.data[0] : { quantity: 0 };
};


// Dashboard Statistics
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getSalesChartData = async (params = {}) => {
  const response = await api.get('/dashboard/sales-chart', { params });
  return response.data;
};

export const getTopProducts = async (params = {}) => {
  const response = await api.get('/dashboard/top-products', { params });
  return response.data;
};

export default api;