import React from 'react';
import Navbar from '../Navbar';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel de Usuario</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Bienvenido al sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
