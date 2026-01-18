import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/orders`, config);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(`${API}/orders/${orderId}`, { status }, config);
      toast.success('Sipariş durumu güncellendi');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const map = {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6" data-testid="orders-management">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Yönetimi</h1>
        <p className="text-gray-600">{orders.length} sipariş</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Sipariş Kodu</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Müşteri</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Tutar</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Durum</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Tarih</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  data-testid={`order-row-${index}`}
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-mono font-bold text-[#78BE20]">{order.order_code}</span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">
                    ₺{order.total_amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${getStatusColor(
                        order.status
                      )}`}
                      data-testid={`order-status-select-${index}`}
                    >
                      <option value="pending">Bekliyor</option>
                      <option value="confirmed">Onaylandı</option>
                      <option value="shipped">Kargoda</option>
                      <option value="delivered">Teslim Edildi</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#78BE20] hover:text-[#65A318] transition-colors"
                      data-testid={`view-order-${index}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            data-testid="order-detail-modal"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Detayları</h2>

            <div className="bg-[#F9FCF8] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">Sipariş Kodu</p>
              <p className="text-2xl font-black text-[#78BE20] font-mono">{selectedOrder.order_code}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Müşteri Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Ad Soyad:</span> <span className="font-medium">{selectedOrder.customer_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">E-posta:</span> <span className="font-medium">{selectedOrder.customer_email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Telefon:</span> <span className="font-medium">{selectedOrder.customer_phone}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Adres:</span> <span className="font-medium">{selectedOrder.customer_address}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">IBAN:</span> <span className="font-medium font-mono">{selectedOrder.customer_iban}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Ödeme Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  {selectedOrder.receipt_file_url && (
                    <div>
                      <span className="text-gray-600">Ödeme Dekontu:</span>
                      <div className="mt-2">
                        <a 
                          href={selectedOrder.receipt_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#78BE20] text-white rounded-lg hover:bg-[#65A318] transition-colors"
                          data-testid="view-receipt-button"
                        >
                          Dekontu Görüntüle
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Ürünler</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        {item.variant && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#78BE20]/10 text-[#78BE20] mt-1">
                            {item.variant}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#78BE20]">₺{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 mt-4">
                  <span className="font-bold text-lg">Toplam</span>
                  <span className="font-black text-2xl text-[#78BE20]">₺{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-bold transition-colors"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OrdersManagement;