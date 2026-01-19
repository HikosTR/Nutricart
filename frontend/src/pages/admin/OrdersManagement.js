import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Package, Eye, Search, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ITEMS_PER_PAGE = 15;

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/orders`, config);
      // Sort by date descending (newest first)
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    
    const term = searchTerm.toLowerCase().trim();
    return orders.filter(order => {
      // Search by order code
      if (order.order_code?.toLowerCase().includes(term)) return true;
      // Search by customer name
      if (order.customer_name?.toLowerCase().includes(term)) return true;
      // Search by customer email
      if (order.customer_email?.toLowerCase().includes(term)) return true;
      // Search by customer phone
      if (order.customer_phone?.includes(term)) return true;
      // Search by date (formatted)
      const dateStr = new Date(order.created_at).toLocaleDateString('tr-TR');
      if (dateStr.includes(term)) return true;
      return false;
    });
  }, [orders, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6" data-testid="orders-management">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Yönetimi</h1>
          <p className="text-gray-600">
            {searchTerm ? `${filteredOrders.length} sonuç bulundu` : `${orders.length} sipariş`}
          </p>
        </div>
        
        {/* Search Button & Input */}
        <div className="flex items-center space-x-3">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ad, sipariş no, tarih ara..."
                  className="w-full h-12 pl-4 pr-10 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20"
                  autoFocus
                  data-testid="search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              searchOpen || searchTerm
                ? 'bg-[#78BE20] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="search-toggle-button"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
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
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz sipariş yok'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} / {filteredOrders.length} sipariş
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                data-testid="prev-page-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#78BE20] text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                      data-testid={`page-${page}-button`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                data-testid="next-page-button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
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
                    {selectedOrder.customer_iban && (
                      <p>
                        <span className="text-gray-600">IBAN:</span> <span className="font-medium font-mono">{selectedOrder.customer_iban}</span>
                      </p>
                    )}
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
      </AnimatePresence>
    </div>
  );
};

export default OrdersManagement;
