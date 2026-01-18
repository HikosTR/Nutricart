import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: '',
    iban: '',
    bank_name: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setFormData({
        account_holder_name: response.data.account_holder_name,
        iban: response.data.iban,
        bank_name: response.data.bank_name || '',
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
      await axios.put(`${API}/payment-settings`, formData, config);
      toast.success('Ödeme ayarları güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız', { description: error.response?.data?.detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="payment-settings">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Ayarları</h1>
        <p className="text-gray-600">Müşterilerin ödeme yapacağı hesap bilgilerini yönetin</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#78BE20]/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#78BE20]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Banka Hesap Bilgileri</h2>
            <p className="text-sm text-gray-600">Bu bilgiler checkout sayfasında gösterilecek</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hesap Sahibi Adı *
            </label>
            <input
              type="text"
              value={formData.account_holder_name}
              onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
              required
              className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
              placeholder="Herbalife Türkiye"
              data-testid="account-holder-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN *
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              required
              className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 font-mono"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              data-testid="iban-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banka Adı (Opsiyonel)
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
              placeholder="Türkiye İş Bankası"
              data-testid="bank-name-input"
            />
          </div>

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
            <strong>Not:</strong> Bu bilgiler müşterilerin ödeme yapması için checkout sayfasında görüntülenecektir.
            Lütfen bilgilerin doğru olduğundan emin olun.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSettings;
