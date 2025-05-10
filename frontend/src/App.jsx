// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import ProductManagement from './components/Products/ProductManagement';
import IngredientManagement from './components/Ingredients/IngredientManagement';
import ProductDetail from './components/Products/ProductDetail';
import Users from './components/Users/User';
import InventoryManagement from './components/Inventory/InventoryManagement';
import ClientManagement from './components/Clients/ClientManagement';
import SupplierManagement from './components/Suppliers/SupplierManagement';
import SaleManagement from './components/Sales/SaleManagement';
import SaleDetail from './components/Sales/SaleDetail';
import SaleForm from './components/Sales/SaleForm';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
  });

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <ProductManagement /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/ingredients"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <IngredientManagement /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <Users /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

                <Route
          path="/inventory"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <InventoryManagement /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <ClientManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              {auth.role === 'admin' ? <SupplierManagement /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />
        
        <Route
  path="/sales"
  element={
    <PrivateRoute>
      <SaleManagement />
    </PrivateRoute>
  }
/>

<Route
  path="/sales/new"
  element={
    <PrivateRoute>
      <SaleForm />
    </PrivateRoute>
  }
/>

<Route
  path="/sales/:id"
  element={
    <PrivateRoute>
      <SaleDetail />
    </PrivateRoute>
  }
/>
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;