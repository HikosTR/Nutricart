import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WelcomePopup = () => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Don't show popup on admin pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }
    checkAndShowPopup();
  }, [location.pathname]);

  const checkAndShowPopup = async () => {
    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
    if (hasSeenPopup) return;

    try {
      const response = await axios.get(`${API}/site-settings`);
      const data = response.data;
      
      if (data.popup_enabled && (data.popup_image_url || data.popup_title || data.popup_content)) {
        setSettings(data);
        setShow(true);
      }
    } catch (error) {
      console.error('Error fetching popup settings:', error);
    }
  };

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  if (!show || !settings) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            data-testid="welcome-popup"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 transition-all"
              data-testid="popup-close-button"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            {settings.logo_url && (
              <div className="bg-gradient-to-b from-[#78BE20]/10 to-white pt-8 pb-4 px-8 flex justify-center">
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-16 object-contain"
                  data-testid="popup-logo"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8 pt-4">
              {/* Popup Image */}
              {settings.popup_image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden">
                  <img
                    src={settings.popup_image_url}
                    alt="Popup"
                    className="w-full h-48 object-cover"
                    data-testid="popup-image"
                  />
                </div>
              )}

              {/* Title */}
              {settings.popup_title && (
                <h2 
                  className="text-2xl font-bold text-gray-900 text-center mb-4"
                  data-testid="popup-title"
                >
                  {settings.popup_title}
                </h2>
              )}

              {/* Content */}
              {settings.popup_content && (
                <div 
                  className="text-gray-600 text-center mb-6 whitespace-pre-wrap"
                  data-testid="popup-content"
                >
                  {settings.popup_content}
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleClose}
                className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
                data-testid="popup-continue-button"
              >
                Siteye Devam Et
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
