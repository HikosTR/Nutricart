import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CheckCircle, Package, Truck, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Sipariş bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!', { description: text });
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8" />;
      case 'confirmed':
        return <CheckCircle className="w-8 h-8" />;
      case 'shipped':
        return <Truck className="w-8 h-8" />;
      case 'delivered':
        return <Package className="w-8 h-8" />;
      default:
        return <Clock className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#78BE20] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sipariş Bulunamadı</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-[#78BE20] hover:bg-[#65A318] text-white px-8 py-3 rounded-full font-bold"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#78BE20]/10 text-[#78BE20] mb-6">
              {getStatusIcon(order.status)}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" data-testid="order-tracking-title">
              Siparişiniz {getStatusText(order.status)}
            </h1>
            <p className="text-gray-600">Sipariş No: <span className="font-mono font-bold" data-testid="order-id">{order.id}</span></p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#F9FCF8] rounded-3xl p-8"
              data-testid="order-details"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ödeme Bilgileri</h2>
              
              <div className="bg-white rounded-2xl p-6 border-2 border-[#78BE20]">
                <p className="text-sm text-gray-600 mb-4">
                  Lütfen ödemenizi aşağıdaki hesaba yapınız. Ödeme yaptıktan sonra, sipariş işleme alınacaktır.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Alıcı IBAN</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <span className="font-mono font-bold text-sm" data-testid="customer-iban">{order.customer_iban}</span>
                      <button
                        onClick={() => copyToClipboard(order.customer_iban)}
                        className="text-[#78BE20] hover:text-[#65A318] transition-colors"
                        data-testid="copy-iban-button"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tutar</p>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <span className="text-2xl font-black text-[#78BE20]" data-testid="order-total">
                        ₺{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {order.receipt_file_url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ödeme Dekontu</p>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <a 
                          href={order.receipt_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#78BE20] hover:text-[#65A318] text-sm underline flex items-center space-x-2"
                          data-testid="receipt-link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Dekontu Görüntüle</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Detayları</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0" data-testid={`order-item-${index}`}>
                    <div>
                      <p className="font-bold text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#78BE20]">₺{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Teslimat Bilgileri</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Ad Soyad</p>
                  <p className="font-bold text-gray-900" data-testid="customer-name">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-bold text-gray-900" data-testid="customer-phone">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-bold text-gray-900" data-testid="customer-email">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-bold text-gray-900" data-testid="customer-address">{order.customer_address}</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              onClick={() => navigate('/')}
              className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="back-to-home-button"
            >
              Alışverişe Devam Et
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;