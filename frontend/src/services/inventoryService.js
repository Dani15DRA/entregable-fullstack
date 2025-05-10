import api from './api';

// Almacenes
export const getWarehouses = async () => {
  const response = await api.get('/warehouses');
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const response = await api.post('/warehouses', warehouseData);
  return response.data;
};

export const updateWarehouse = async (id, warehouseData) => {
  const response = await api.put(`/warehouses/${id}`, warehouseData);
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await api.delete(`/warehouses/${id}`);
  return response.data;
};

// Inventario
export const getInventory = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/inventory?${params.toString()}`);
  return response.data;
};

export const updateInventoryItem = async (id, inventoryData) => {
  const response = await api.put(`/inventory/${id}`, inventoryData);
  return response.data;
};

export const createInventoryItem = async (inventoryData) => {  // Cambiar invventoryData por inventoryData
  const response = await api.post('/inventory', inventoryData);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/inventory/${id}`);
  return response.data;
};

// Movimientos
export const getMovements = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/movements?${params.toString()}`);
  return response.data;
};