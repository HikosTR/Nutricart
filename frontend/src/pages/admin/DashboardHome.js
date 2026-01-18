import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

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

      const products = productsRes.data;
      const orders = ordersRes.data;

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-[#78BE20]',
    },
    {
      title: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Bekleyen Sipariş',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-home">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Hoş geldiniz! İşletme özetiniz aşağıda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Son Siparişler</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="recent-orders-table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Sipariş Kodu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Müşteri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tutar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0" data-testid={`order-row-${index}`}>
                    <td className="py-3 px-4 text-sm font-mono font-bold text-[#78BE20]">{order.order_code}</td>
                    <td className="py-3 px-4 text-sm">{order.customer_name}</td>
                    <td className="py-3 px-4 text-sm font-bold">₺{order.total_amount.toFixed(2)}</td>
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
          <p className="text-gray-500 text-center py-8">Henüz sipariş yok</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;