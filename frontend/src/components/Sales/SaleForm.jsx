import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Table, 
  Card, 
  Row, 
  Col, 
  InputNumber, 
  message,
  Divider,
  Tag,
  Alert
} from 'antd';
import { 
  getClients, 
  getProducts, 
  createSale,
  getProductStock
} from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Navbar from '../Navbar';

const { Option } = Select;

const SaleForm = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStock, setProductStock] = useState({});
  const [stockErrors, setStockErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients(clientSearch);
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      message.error('Error al cargar clientes');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ search: productSearch });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Error al cargar productos');
    }
  };

  const fetchProductStock = async (productId) => {
    try {
      const response = await getProductStock(productId);
      setProductStock(prev => ({
        ...prev,
        [productId]: response.quantity
      }));
      return response.quantity;
    } catch (error) {
      console.error('Error fetching stock:', error);
      return 0;
    }
  };

  const handleAddProduct = async () => {
    const productId = form.getFieldValue('productId');
    const quantity = form.getFieldValue('quantity') || 1;
    
    if (!productId) {
      message.warning('Seleccione un producto');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Obtener stock actualizado
    const availableStock = await fetchProductStock(productId);

    if (quantity > availableStock) {
      setStockErrors(prev => ({
        ...prev,
        [productId]: `Solo hay ${availableStock} unidades disponibles`
      }));
      return;
    }

    const existingIndex = selectedProducts.findIndex(p => p.product_id === productId);
    
    if (existingIndex >= 0) {
      const totalQuantity = selectedProducts[existingIndex].quantity + quantity;
      if (totalQuantity > availableStock) {
        setStockErrors(prev => ({
          ...prev,
          [productId]: `Solo hay ${availableStock} unidades disponibles`
        }));
        return;
      }
      
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex].quantity += quantity;
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          product_id: productId,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: product.price * quantity,
          available: availableStock
        }
      ]);
    }

    // Resetear campos y errores
    form.setFieldsValue({ productId: undefined, quantity: 1 });
    setStockErrors(prev => ({ ...prev, [productId]: undefined }));
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
    setStockErrors(prev => ({ ...prev, [productId]: undefined }));
  };

  const handleQuantityChange = (value) => {
    const productId = form.getFieldValue('productId');
    if (!productId) return;
    
    const availableStock = productStock[productId] || 0;
    if (value > availableStock) {
      setStockErrors(prev => ({
        ...prev,
        [productId]: `No puedes exceder el stock disponible (${availableStock})`
      }));
    } else {
      setStockErrors(prev => ({ ...prev, [productId]: undefined }));
    }
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16; // IVA 16%
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    const { subtotal, tax, total } = calculateTotals();

    if (selectedProducts.length === 0) {
      message.warning('Agregue al menos un producto');
      return;
    }

    // Verificar stock nuevamente antes de enviar
    for (const item of selectedProducts) {
      const availableStock = productStock[item.product_id] || 0;
      if (item.quantity > availableStock) {
        message.error(`Stock insuficiente para ${item.name}. Disponible: ${availableStock}, Solicitado: ${item.quantity}`);
        return;
      }
    }

    // Asegurarse de que client_id no sea undefined
    const saleData = {
      client_id: values.client_id || null, // Convertir undefined a null
      items: selectedProducts.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity
      })),
      payment_method: values.payment_method,
      notes: values.notes || null, // Convertir undefined a null
      subtotal,
      tax,
      total
    };

    // Validación adicional para asegurar que no haya undefined
    if (saleData.items.some(item => item.product_id === undefined || item.quantity === undefined)) {
      throw new Error('Datos de productos inválidos');
    }

    setLoading(true);
    const response = await createSale(saleData);
    message.success('Venta creada exitosamente');
    navigate(`/sales/${response.id}`);
  } catch (error) {
    console.error('Error creating sale:', error);
    message.error(error.response?.data?.message || 'Error al crear la venta');
  } finally {
    setLoading(false);
  }
};

  const { subtotal, tax, total } = calculateTotals();

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'price',
      key: 'price',
      render: price => formatCurrency(price),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Disponible',
      key: 'available',
      render: (_, record) => (
        <Tag color={record.available < record.quantity ? 'red' : 'green'}>
          {record.available}
        </Tag>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleRemoveProduct(record.product_id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="sale-form p-4">
        <Card title="Nueva Venta" bordered={false}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="client_id"
                  label="Cliente"
                  rules={[{ required: true, message: 'Seleccione un cliente' }]}
                >
                  <Select
                    showSearch
                    placeholder="Buscar cliente"
                    filterOption={false}
                    onSearch={setClientSearch}
                    onChange={fetchClients}
                  >
                    {clients.map(client => (
                      <Option key={client.id} value={client.id}>
                        {`${client.first_name} ${client.last_name}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="payment_method"
                  label="Método de Pago"
                  rules={[{ required: true, message: 'Seleccione método de pago' }]}
                >
                  <Select placeholder="Seleccione método de pago">
                    <Option value="Efectivo">Efectivo</Option>
                    <Option value="Tarjeta Crédito">Tarjeta Crédito</Option>
                    <Option value="Tarjeta Débito">Tarjeta Débito</Option>
                    <Option value="Transferencia">Transferencia</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Productos</Divider>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="productId" label="Producto">
                  <Select
                    showSearch
                    placeholder="Buscar producto"
                    filterOption={false}
                    onSearch={setProductSearch}
                    onChange={(value) => {
                      fetchProducts();
                      if (value) fetchProductStock(value);
                    }}
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="quantity" label="Cantidad" initialValue={1}>
                  <InputNumber 
                    min={1} 
                    onChange={handleQuantityChange}
                    style={{ width: '100%' }} 
                  />
                </Form.Item>
              </Col>
              <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button type="dashed" onClick={handleAddProduct}>
                  Agregar Producto
                </Button>
              </Col>
            </Row>

            {form.getFieldValue('productId') && stockErrors[form.getFieldValue('productId')] && (
              <Alert
                message={stockErrors[form.getFieldValue('productId')]}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              dataSource={selectedProducts}
              columns={columns}
              pagination={false}
              rowKey="product_id"
              style={{ marginBottom: 24 }}
              locale={{
                emptyText: 'No hay productos agregados'
              }}
            />

            <Divider orientation="left">Resumen</Divider>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="notes" label="Notas">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="sale-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>IVA (16%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button 
                type="primary" 
                onClick={handleSubmit}
                loading={loading}
                disabled={selectedProducts.length === 0}
                size="large"
              >
                Registrar Venta
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SaleForm;