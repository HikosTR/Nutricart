import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  Video,
  Image,
  ShoppingCart,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import DashboardHome from './DashboardHome';
import ProductsManagement from './ProductsManagement';
import VideosManagement from './VideosManagement';
import BannersManagement from './BannersManagement';
import OrdersManagement from './OrdersManagement';
import TestimonialsManagement from './TestimonialsManagement';
import PaymentSettings from './PaymentSettings';
import SiteSettings from './SiteSettings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Çıkış yapıldı');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Ürünler' },
    { path: '/admin/videos', icon: Video, label: 'Videolar' },
    { path: '/admin/banners', icon: Image, label: "Banner'lar" },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Siparişler' },
    { path: '/admin/testimonials', icon: MessageSquare, label: 'Yorumlar' },
    { path: '/admin/payment-settings', icon: CreditCard, label: 'Ödeme Ayarları' },
    { path: '/admin/site-settings', icon: Settings, label: 'Site Ayarları' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black">
          <span className="text-[#78BE20]">Herba</span>
          <span className="text-black">Life</span>
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600"
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        data-testid="admin-sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-black">
              <span className="text-[#78BE20]">Herba</span>
              <span className="text-black">Life</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#78BE20] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="videos" element={<VideosManagement />} />
            <Route path="banners" element={<BannersManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="payment-settings" element={<PaymentSettings />} />
            <Route path="site-settings" element={<SiteSettings />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
    </div>
  );
};

export default Dashboard;