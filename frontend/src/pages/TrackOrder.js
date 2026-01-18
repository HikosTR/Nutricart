import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { Search, Package } from 'lucide-react';

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/order/${orderId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FCF8]">
      <TopBar />
      <Navbar />
      
      <div className="pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#78BE20]/10 mb-6">
              <Package className="w-10 h-10 text-[#78BE20]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" data-testid="track-order-title">
              Siparişimi Takip Et
            </h1>
            <p className="text-lg text-gray-600">
              Sipariş numaranızı girerek siparişinizin durumunu öğrenin
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100"
          >
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sipariş Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    required
                    className="w-full h-14 rounded-xl border-2 border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white pl-12 pr-4 text-lg font-mono uppercase"
                    placeholder="HRB-XXXXXX"
                    maxLength={10}
                    data-testid="order-id-input"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sipariş kodunuz sipariş tamamlandıktan sonra gösterilir (örn: HRB-A1B2C3)
                </p>
              </div>

              <motion.button
                type="submit"
                className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="track-button"
              >
                <Search className="w-5 h-5" />
                <span>Siparişi Sorgula</span>
              </motion.button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> Sipariş numaranızı bulamıyorsanız, lütfen e-posta kutunuzu kontrol edin 
                veya WhatsApp üzerinden bizimle iletişime geçin.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
