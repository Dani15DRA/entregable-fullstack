import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Table, 
  Button, 
  message,
  Tag,
  Space,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  getSaleById, 
  cancelSale 
} from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Navbar from '../Navbar';

const { Text, Title } = Typography;

const SaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSale();
  }, [id]);

  const fetchSale = async () => {
    setLoading(true);
    try {
      const data = await getSaleById(id);
      setSale(data);
    } catch (error) {
      message.error('Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSale = async () => {
    setCancelling(true);
    try {
      await cancelSale(id);
      message.success('Venta cancelada exitosamente');
      fetchSale();
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al cancelar la venta');
    } finally {
      setCancelling(false);
    }
  };

  if (!sale) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card 
            title={<Title level={4} className="mb-0">Detalle de Venta #{sale.id}</Title>}
            extra={
              <Button onClick={() => navigate('/sales')}>
                Volver
              </Button>
            }
            loading={loading}
            className="shadow-sm"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Fecha">
                    <Text strong>{formatDate(sale.sale_date, 'DD/MM/YYYY HH:mm')}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Tag color={sale.status === 'Completada' ? 'green' : 'red'}>
                      {sale.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Atendido por">
                    {sale.user_username}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Cliente">
                    {sale.client_first_name || 'Sin cliente'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Documento">
                    {sale.client_identification_type}: {sale.client_identification_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Método de Pago">
                    {sale.payment_method}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            {sale.notes && (
              <Card size="small" title="Notas" className="mt-4">
                <Text>{sale.notes}</Text>
              </Card>
            )}
          </Card>

          <Card title="Productos" className="shadow-sm">
            <Table
              columns={[
                { 
                  title: 'Producto', 
                  dataIndex: 'product_name', 
                  key: 'product_name',
                  width: '40%'
                },
                { 
                  title: 'Precio', 
                  dataIndex: 'unit_price', 
                  key: 'unit_price',
                  render: price => formatCurrency(price),
                  align: 'right',
                  width: '20%'
                },
                { 
                  title: 'Cantidad', 
                  dataIndex: 'quantity', 
                  key: 'quantity',
                  align: 'center',
                  width: '15%'
                },
                { 
                  title: 'Total', 
                  dataIndex: 'total_price', 
                  key: 'total_price',
                  render: price => formatCurrency(price),
                  align: 'right',
                  width: '25%'
                }
              ]}
              dataSource={sale.details}
              rowKey="product_id"
              pagination={false}
              size="small"
            />
          </Card>

          <Card className="shadow-sm">
            <Row justify="end">
              <Col xs={24} sm={12} md={8}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Subtotal">
                    <Text strong>{formatCurrency(sale.subtotal)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="IVA (16%)">
                    <Text strong>{formatCurrency(sale.tax)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total">
                    <Text strong type="success">{formatCurrency(sale.total)}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            {sale.status === 'Completada' && (
              <Row justify="end" className="mt-4">
                <Col>
                  <Button 
                    type="primary" 
                    danger 
                    onClick={handleCancelSale}
                    loading={cancelling}
                  >
                    Cancelar Venta
                  </Button>
                </Col>
              </Row>
            )}
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default SaleDetail;