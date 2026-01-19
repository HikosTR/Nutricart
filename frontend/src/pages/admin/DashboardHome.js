import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, DollarSign, TrendingUp, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardHome = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`, config),
        axios.get(`${API}/orders`, config),
      ]);

      setProducts(productsRes.data);
      // Sort orders by date descending
      const sortedOrders = ordersRes.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return orderDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      }
      return true;
    });
  }, [orders, startDate, endDate]);

  // Calculate stats based on filtered orders
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    
    return {
      totalProducts: products.length,
      totalOrders: filteredOrders.length,
      totalRevenue,
      pendingOrders,
    };
  }, [filteredOrders, products]);

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const isFiltered = startDate || endDate;

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: isFiltered ? 'Filtrelenmiş Sipariş' : 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-[#78BE20]',
    },
    {
      title: isFiltered ? 'Filtrelenmiş Gelir' : 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      highlight: isFiltered,
    },
    {
      title: 'Bekleyen Sipariş',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  // Recent orders (from filtered list)
  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <div className="space-y-8" data-testid="dashboard-home">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            {isFiltered 
              ? `${startDate || '∞'} - ${endDate || '∞'} tarihleri arası` 
              : 'Hoş geldiniz! İşletme özetiniz aşağıda.'}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 text-sm"
              data-testid="start-date-input"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 text-sm"
              data-testid="end-date-input"
            />
          </div>
          {isFiltered && (
            <button
              onClick={clearDateFilter}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filtreyi Temizle"
              data-testid="clear-date-filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl p-6 border transition-all ${
              stat.highlight 
                ? 'border-purple-300 ring-2 ring-purple-100' 
                : 'border-gray-200 hover:shadow-lg'
            }`}
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.highlight && (
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  Filtreli
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isFiltered ? 'Filtrelenmiş Siparişler' : 'Son Siparişler'}
          </h2>
          {isFiltered && (
            <span className="text-sm text-gray-500">
              {filteredOrders.length} sipariş bulundu
            </span>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="recent-orders-table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Sipariş Kodu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Müşteri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tutar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tarih</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0" data-testid={`order-row-${index}`}>
                    <td className="py-3 px-4 text-sm font-mono font-bold text-[#78BE20]">{order.order_code}</td>
                    <td className="py-3 px-4 text-sm">{order.customer_name}</td>
                    <td className="py-3 px-4 text-sm font-bold">₺{order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status === 'pending' ? 'Bekliyor' :
                         order.status === 'confirmed' ? 'Onaylandı' :
                         order.status === 'shipped' ? 'Kargoda' : 'Teslim Edildi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {isFiltered ? 'Bu tarih aralığında sipariş bulunamadı' : 'Henüz sipariş yok'}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
