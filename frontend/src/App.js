import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import WhatsAppButton from './components/WhatsAppButton';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
          <WhatsAppButton />
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;