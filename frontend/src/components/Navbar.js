import { ShoppingCart, Instagram, Menu, X, Phone } from 'lucide-react';
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
  const [whatsappNumber, setWhatsappNumber] = useState('+90 542 140 07 55');
  const cartCount = getCartCount();

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setLogoUrl(response.data.logo_url);
      if (response.data.whatsapp_number) {
        setWhatsappNumber(response.data.whatsapp_number);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const getWhatsAppLink = () => {
    const cleanNumber = whatsappNumber.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanNumber.replace('+', '')}`;
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

            {/* WhatsApp İletişim */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-link"
              className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden lg:inline">{whatsappNumber}</span>
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