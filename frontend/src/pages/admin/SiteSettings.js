import { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SiteSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setFormData({
        logo_url: response.data.logo_url,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(`${API}/site-settings`, formData, config);
      toast.success('Site ayarları güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız', { description: error.response?.data?.detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="site-settings">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Ayarları</h1>
        <p className="text-gray-600">Sitenizin genel görünümünü yönetin</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#78BE20]/10 flex items-center justify-center">
            <Image className="w-6 h-6 text-[#78BE20]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Logo Yönetimi</h2>
            <p className="text-sm text-gray-600">Sitenizde görünecek logoyu ayarlayın</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL *
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              required
              className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
              placeholder="https://example.com/logo.png"
              data-testid="logo-url-input"
            />
            <p className="text-xs text-gray-500 mt-2">
              Logo görselinizin URL'sini girin (PNG veya JPG önerilir)
            </p>
          </div>

          {formData.logo_url && (
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Logo Önizleme:</p>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 border border-gray-200">
                <img 
                  src={formData.logo_url} 
                  alt="Logo Preview" 
                  className="max-h-24 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x50?text=Logo';
                  }}
                />
              </div>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            data-testid="save-settings-button"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </motion.button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Logo değişiklikleri tüm sayfalarda otomatik olarak güncellenecektir.
            Önerilen boyut: 200x60 piksel veya benzer oranlarda.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteSettings;
