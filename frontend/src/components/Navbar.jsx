import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
                Sistema de Gestión
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Inicio
              </Link>
              
              {role === 'admin' && (
                <>
                  <Link
                    to="/inventory"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/inventory')
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Inventario
                  </Link>

                  <Link
                    to="/sales"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/sales')
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Ventas
                  </Link>

                  {/* Menú de Mantenimiento */}
                  <div className="relative h-full flex items-center">
                    <div>
                      <button
                        onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isActive('/products') || 
                          isActive('/ingredients') || 
                          isActive('/users') || 
                          isActive('/clients') || 
                          isActive('/warehouse') || 
                          isActive('/suppliers')
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        Mantenimiento
                        <svg
                          className={`ml-1 h-5 w-5 transform transition-transform ${
                            isMaintenanceOpen ? 'rotate-180' : ''
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {isMaintenanceOpen && (
                        <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                          <Link
                            to="/products"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/products')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Productos
                          </Link>
                          <Link
                            to="/ingredients"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/ingredients')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Ingredientes
                          </Link>
                          <Link
                            to="/users"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/users')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Usuarios
                          </Link>
                          <Link
                            to="/clients"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/clients')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Clientes
                          </Link>
                          <Link
                            to="/suppliers"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/suppliers')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Proveedores
                          </Link>
                          <Link
                            to="/warehouse"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/warehouse')
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Almacén
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 text-sm">{email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;