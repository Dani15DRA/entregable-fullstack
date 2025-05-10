import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Table, 
  Button, 
  message,
  Tag,
  Space
} from 'antd';
import { 
  getSaleById, 
  cancelSale 
} from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Navbar from '../Navbar';

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
      console.error('Error fetching sale:', error);
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
      console.error('Error cancelling sale:', error);
      message.error(error.response?.data?.message || 'Error al cancelar la venta');
    } finally {
      setCancelling(false);
    }
  };

  if (!sale) return <div>Cargando...</div>;

  return (
                <div className="min-h-screen bg-gray-50">
      <Navbar />
    <div className="sale-detail">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card 
          title={`Venta #${sale.id}`} 
          extra={
            <Button onClick={() => navigate('/sales')}>
              Volver
            </Button>
          }
          loading={loading}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Fecha">{formatDate(sale.sale_date)}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={sale.status === 'Completada' ? 'green' : 'red'}>
                {sale.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cliente">
              {sale.client_first_name} {sale.client_last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Atendido por">{sale.user_username}</Descriptions.Item>
            <Descriptions.Item label="Método de Pago">{sale.payment_method}</Descriptions.Item>
            <Descriptions.Item label="Notas">{sale.notes || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Productos">
          <Table
            columns={[
              { title: 'Producto', dataIndex: 'product_name', key: 'product_name' },
              { 
                title: 'Precio Unitario', 
                dataIndex: 'unit_price', 
                key: 'unit_price',
                render: price => formatCurrency(price)
              },
              { title: 'Cantidad', dataIndex: 'quantity', key: 'quantity' },
              { 
                title: 'Total', 
                dataIndex: 'total_price', 
                key: 'total_price',
                render: price => formatCurrency(price)
              },
            ]}
            dataSource={sale.details}
            rowKey="product_id"
            pagination={false}
          />
        </Card>

        <Card>
          <div className="sale-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="total-row">
              <span>IVA (16%):</span>
              <span>{formatCurrency(sale.tax)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </Card>

        {sale.status === 'Completada' && (
          <div style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              danger 
              onClick={handleCancelSale}
              loading={cancelling}
            >
              Cancelar Venta
            </Button>
          </div>
        )}
      </Space>
    </div>
        </div>

  );
};

export default SaleDetail;