import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LegalPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageContent = () => {
    switch (type) {
      case 'iade-degisim':
        return {
          title: 'İade & Değişim Politikası',
          content: settings?.return_policy || 'İade ve değişim politikası henüz eklenmemiş.',
        };
      case 'mesafeli-satis':
        return {
          title: 'Mesafeli Satış Sözleşmesi',
          content: settings?.sales_agreement || 'Mesafeli satış sözleşmesi henüz eklenmemiş.',
        };
      case 'gizlilik':
        return {
          title: 'KVKK & Gizlilik Politikası',
          content: settings?.privacy_policy || 'Gizlilik politikası henüz eklenmemiş.',
        };
      default:
        return {
          title: 'Sayfa Bulunamadı',
          content: 'İstediğiniz sayfa bulunamadı.',
        };
    }
  };

  const pageData = getPageContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <div className="pt-36 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#78BE20] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />
      
      <div className="pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-[#78BE20] transition-colors mb-8"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8" data-testid="legal-title">
              {pageData.title}
            </h1>

            <div 
              className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap"
              data-testid="legal-content"
            >
              {pageData.content}
            </div>

            {/* Company Info */}
            {settings && (settings.company_name || settings.company_address || settings.company_tax_number) && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Firma Bilgileri</h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-2 text-sm">
                  {settings.company_name && (
                    <p><span className="text-gray-500">Firma Adı:</span> <span className="font-medium">{settings.company_name}</span></p>
                  )}
                  {settings.company_address && (
                    <p><span className="text-gray-500">Adres:</span> <span className="font-medium">{settings.company_address}</span></p>
                  )}
                  {settings.company_tax_number && (
                    <p><span className="text-gray-500">Vergi No:</span> <span className="font-medium">{settings.company_tax_number}</span></p>
                  )}
                  {settings.footer_phone && (
                    <p><span className="text-gray-500">Telefon:</span> <span className="font-medium">{settings.footer_phone}</span></p>
                  )}
                  {settings.footer_email && (
                    <p><span className="text-gray-500">E-posta:</span> <span className="font-medium">{settings.footer_email}</span></p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
