import { ShoppingCart, Instagram, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = () => {
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('https://customer-assets.emergentagent.com/job_herbalife-shop-3/artifacts/51go848j_Ekran%20Resmi%202026-01-18%2004.46.44.png');
  const cartCount = getCartCount();

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setLogoUrl(response.data.logo_url);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  return (
    <motion.nav
      data-testid="main-navbar"
      className="fixed top-[36px] left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={logoUrl} 
                alt="HerbaLife Logo" 
                className="h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="text-3xl font-black tracking-tighter" style={{ display: 'none' }}>
                <span className="text-[#78BE20]">Herba</span>
                <span className="text-black">Life</span>
              </div>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              data-testid="nav-home-link"
              className="text-gray-700 hover:text-[#78BE20] font-medium transition-colors duration-200"
            >
              Ana Sayfa
            </Link>
            <a
              href="#products"
              data-testid="nav-products-link"
              className="text-gray-700 hover:text-[#78BE20] font-medium transition-colors duration-200"
            >
              Ürünler
            </a>
            <Link
              to="/track-order"
              data-testid="nav-track-order-link"
              className="text-gray-700 hover:text-[#78BE20] font-medium transition-colors duration-200"
            >
              Sipariş Takip
            </Link>
            <a
              href="#testimonials"
              data-testid="nav-testimonials-link"
              className="text-gray-700 hover:text-[#78BE20] font-medium transition-colors duration-200"
            >
              Yorumlar
            </a>

            <a
              href="https://www.instagram.com/herbalife/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="instagram-link"
              className="text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              <Instagram className="w-5 h-5" />
            </a>

            <button
              onClick={() => navigate('/cart')}
              data-testid="cart-button"
              className="relative text-gray-700 hover:text-[#78BE20] transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  data-testid="cart-count-badge"
                  className="absolute -top-2 -right-2 bg-[#78BE20] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
            data-testid="mobile-menu"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-[#78BE20] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <a
                href="#products"
                className="block text-gray-700 hover:text-[#78BE20] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ürünler
              </a>
              <Link
                to="/track-order"
                className="block text-gray-700 hover:text-[#78BE20] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sipariş Takip
              </Link>
              <a
                href="#testimonials"
                className="block text-gray-700 hover:text-[#78BE20] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Yorumlar
              </a>
              <button
                onClick={() => {
                  navigate('/cart');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#78BE20] font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Sepetim ({cartCount})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;