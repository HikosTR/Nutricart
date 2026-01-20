import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Save, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bank');
  const [formData, setFormData] = useState({
    account_holder_name: '',
    iban: '',
    bank_name: '',
    card_payment_enabled: false,
    card_payment_provider: '',
    // Iyzico
    iyzico_api_key: '',
    iyzico_secret_key: '',
    iyzico_sandbox: true,
    // PayTR
    paytr_merchant_id: '',
    paytr_merchant_key: '',
    paytr_merchant_salt: '',
    paytr_sandbox: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setFormData({
        account_holder_name: response.data.account_holder_name || '',
        iban: response.data.iban || '',
        bank_name: response.data.bank_name || '',
        card_payment_enabled: response.data.card_payment_enabled || false,
        card_payment_provider: response.data.card_payment_provider || '',
        iyzico_api_key: response.data.iyzico_api_key || '',
        iyzico_secret_key: response.data.iyzico_secret_key || '',
        iyzico_sandbox: response.data.iyzico_sandbox !== false,
        paytr_merchant_id: response.data.paytr_merchant_id || '',
        paytr_merchant_key: response.data.paytr_merchant_key || '',
        paytr_merchant_salt: response.data.paytr_merchant_salt || '',
        paytr_sandbox: response.data.paytr_sandbox !== false,
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
        <p className="text-gray-600">Ödeme yöntemlerini yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'bank'
              ? 'bg-[#78BE20] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="bank-tab"
        >
          <Banknote className="w-4 h-4" />
          <span>Havale / EFT</span>
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'card'
              ? 'bg-[#78BE20] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="card-tab"
        >
          <CreditCard className="w-4 h-4" />
          <span>Kredi / Banka Kartı</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-8"
        >
          {/* Havale/EFT Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#78BE20]/10 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-[#78BE20]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Banka Hesap Bilgileri</h2>
                  <p className="text-sm text-gray-600">Havale/EFT için hesap bilgileriniz</p>
                </div>
              </div>

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
                  data-testid="account-holder-input"
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
            </div>
          )}

          {/* Kredi Kartı Tab */}
          {activeTab === 'card' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kredi / Banka Kartı</h2>
                  <p className="text-sm text-gray-600">iyzico ve/veya PayTR entegrasyonu</p>
                </div>
              </div>

              {/* Enable Card Payment */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.card_payment_enabled}
                    onChange={(e) => setFormData({ ...formData, card_payment_enabled: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="card-payment-toggle"
                  />
                  <label className="text-sm font-medium text-blue-800">
                    💳 Kredi/Banka Kartı Ödemesini Aktif Et
                  </label>
                </div>
              </div>

              {formData.card_payment_enabled ? (
                <>
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Sağlayıcı
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, card_payment_provider: 'iyzico' })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          formData.card_payment_provider === 'iyzico'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid="provider-iyzico"
                      >
                        <span className="font-bold text-lg">iyzico</span>
                        <span className="text-xs text-gray-500">Popüler seçim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, card_payment_provider: 'paytr' })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          formData.card_payment_provider === 'paytr'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid="provider-paytr"
                      >
                        <span className="font-bold text-lg">PayTR</span>
                        <span className="text-xs text-gray-500">Türk altyapısı</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, card_payment_provider: 'both' })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          formData.card_payment_provider === 'both'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid="provider-both"
                      >
                        <span className="font-bold text-lg">Her İkisi</span>
                        <span className="text-xs text-gray-500">Müşteri seçer</span>
                      </button>
                    </div>
                  </div>

                  {/* Iyzico Settings */}
                  {(formData.card_payment_provider === 'iyzico' || formData.card_payment_provider === 'both') && (
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">iyzico Ayarları</h3>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.iyzico_sandbox}
                            onChange={(e) => setFormData({ ...formData, iyzico_sandbox: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span>Sandbox (Test) Modu</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key *
                        </label>
                        <input
                          type="text"
                          value={formData.iyzico_api_key}
                          onChange={(e) => setFormData({ ...formData, iyzico_api_key: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                          placeholder="sandbox-xxxxx veya xxxxx"
                          data-testid="iyzico-api-key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secret Key *
                        </label>
                        <input
                          type="password"
                          value={formData.iyzico_secret_key}
                          onChange={(e) => setFormData({ ...formData, iyzico_secret_key: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                          placeholder="Gizli anahtar"
                          data-testid="iyzico-secret-key"
                        />
                      </div>
                    </div>
                  )}

                  {/* PayTR Settings */}
                  {(formData.card_payment_provider === 'paytr' || formData.card_payment_provider === 'both') && (
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">PayTR Ayarları</h3>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.paytr_sandbox}
                            onChange={(e) => setFormData({ ...formData, paytr_sandbox: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span>Sandbox (Test) Modu</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Merchant ID *
                        </label>
                        <input
                          type="text"
                          value={formData.paytr_merchant_id}
                          onChange={(e) => setFormData({ ...formData, paytr_merchant_id: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                          placeholder="Mağaza ID"
                          data-testid="paytr-merchant-id"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Merchant Key *
                        </label>
                        <input
                          type="password"
                          value={formData.paytr_merchant_key}
                          onChange={(e) => setFormData({ ...formData, paytr_merchant_key: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                          placeholder="Mağaza anahtarı"
                          data-testid="paytr-merchant-key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Merchant Salt *
                        </label>
                        <input
                          type="password"
                          value={formData.paytr_merchant_salt}
                          onChange={(e) => setFormData({ ...formData, paytr_merchant_salt: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                          placeholder="Mağaza salt değeri"
                          data-testid="paytr-merchant-salt"
                        />
                      </div>
                    </div>
                  )}

                  {formData.card_payment_provider && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">API Entegrasyonu</p>
                          <p>
                            {formData.card_payment_provider === 'iyzico' && 
                              'iyzico API anahtarlarınızı iyzico.com panelinden alabilirsiniz.'
                            }
                            {formData.card_payment_provider === 'paytr' && 
                              'PayTR API bilgilerinizi paytr.com mağaza panelinizden alabilirsiniz.'
                            }
                            {formData.card_payment_provider === 'both' && 
                              'Her iki sağlayıcı için de API bilgilerinizi ilgili panellerden alabilirsiniz. Müşteri checkout sırasında tercih edebilecek.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Kredi/Banka kartı ödemesi devre dışı
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Aktif etmek için yukarıdaki kutucuğu işaretleyin
                  </p>
                </div>
              )}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            data-testid="save-payment-settings"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default PaymentSettings;
