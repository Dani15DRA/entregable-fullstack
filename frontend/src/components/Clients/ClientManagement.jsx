import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient 
} from '../../services/api';
import ClientModal from './ClientModal';
import Navbar from '../Navbar';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getClients(searchTerm);
      setClients(clientsData);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenModal = (client = null) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleSubmit = async (clientData) => {
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, clientData);
        Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
      } else {
        await createClient(clientData);
        Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
      }
      fetchClients();
      setShowModal(false);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
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
      await deleteClient(id);
      Swal.fire('Eliminado', 'Cliente eliminado correctamente', 'success');
      fetchClients();
    } catch (error) {
      // Mensaje específico para clientes con ventas asociadas
      if (error.response?.data?.message?.includes('ventas asociadas')) {
        Swal.fire('Error', error.response.data.message, 'error');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
      }
    }
  }
};

  if (loading) return <div className="text-center py-8">Cargando clientes...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
          <div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.identification_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.identification_type}
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.rfc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(client)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
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

        {/* Modal */}
        <ClientModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          client={selectedClient}
        />
      </div>
    </div>
  );
};

export default ClientManagement;