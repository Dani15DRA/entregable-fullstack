import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSales } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Button, Table, Form, Row, Col, DatePicker, Space, Card, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Navbar from '../Navbar';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SaleManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Limpiar parámetros antes de enviar (eliminar undefined/null)
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
      );
      
      console.log('Params enviados:', cleanParams);
      const data = await getSales(cleanParams);
      console.log('Datos recibidos:', data);
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      message.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const handleSearch = (values) => {
    const newFilters = {};
    
    // Solo agregar filtros si tienen valor
    if (values.dateRange?.[0] && values.dateRange?.[1]) {
      newFilters.startDate = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }
    
    if (values.status) {
      newFilters.status = values.status;
    }
    
    if (values.client_id) {
      newFilters.client_id = values.client_id;
    }
    
    console.log('Nuevos filtros:', newFilters);
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({}); // Resetear filtros para mostrar todas las ventas
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Fecha',
      dataIndex: 'sale_date',
      key: 'sale_date',
      render: (date) => formatDate(date),
    },
    {
      title: 'Cliente',
      key: 'client',
      render: (_, record) => `${record.client_first_name || ''} ${record.client_last_name || ''}`.trim() || 'Sin cliente',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatCurrency(total),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-badge ${status.toLowerCase()}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/sales/${record.id}`)}>Ver</Button>
          {record.status === 'Completada' && (
            <Button danger onClick={() => handleCancelSale(record.id)}>
              Cancelar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleCancelSale = async (id) => {
    try {
      await cancelSale(id);
      message.success('Venta cancelada exitosamente');
      fetchSales();
    } catch (error) {
      message.error('Error al cancelar la venta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="sale-management">
        <Card title="Gestión de Ventas" bordered={false}>
          <Form layout="vertical" onFinish={handleSearch}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="dateRange" label="Rango de Fechas">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Estado">
                  <Select placeholder="Seleccione estado" allowClear>
                    <Option value="Completada">Completada</Option>
                    <Option value="Cancelada">Cancelada</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Buscar
                </Button>
                <Button onClick={handleReset}>
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/sales/new')}
            >
              Nueva Venta
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={sales}
            rowKey="id"
            loading={loading}
            style={{ marginTop: 16 }}
            locale={{ emptyText: 'No hay ventas para mostrar' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default SaleManagement;