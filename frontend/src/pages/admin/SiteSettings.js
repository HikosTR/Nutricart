import { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Save, Bell, Building, FileText, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SiteSettings = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    logo_url: '',
    topbar_message: '',
    whatsapp_number: '',
    footer_about: '',
    footer_phone: '',
    footer_email: '',
    // Popup
    popup_enabled: false,
    popup_image_url: '',
    popup_title: '',
    popup_content: '',
    // Company
    company_name: '',
    company_address: '',
    company_tax_number: '',
    // Legal
    return_policy: '',
    sales_agreement: '',
    privacy_policy: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setFormData({
        logo_url: response.data.logo_url || '',
        topbar_message: response.data.topbar_message || '',
        whatsapp_number: response.data.whatsapp_number || '',
        footer_about: response.data.footer_about || '',
        footer_phone: response.data.footer_phone || '',
        footer_email: response.data.footer_email || '',
        popup_enabled: response.data.popup_enabled || false,
        popup_image_url: response.data.popup_image_url || '',
        popup_title: response.data.popup_title || '',
        popup_content: response.data.popup_content || '',
        company_name: response.data.company_name || '',
        company_address: response.data.company_address || '',
        company_tax_number: response.data.company_tax_number || '',
        return_policy: response.data.return_policy || '',
        sales_agreement: response.data.sales_agreement || '',
        privacy_policy: response.data.privacy_policy || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(`${API}/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData({ ...formData, [field]: response.data.url });
      toast.success('Resim yüklendi!');
    } catch (error) {
      toast.error('Yükleme başarısız');
    } finally {
      setUploading(false);
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

  const tabs = [
    { id: 'general', label: 'Genel', icon: Image },
    { id: 'popup', label: 'Popup', icon: Bell },
    { id: 'company', label: 'Firma Bilgileri', icon: Building },
    { id: 'legal', label: 'Yasal Sayfalar', icon: FileText },
  ];

  return (
    <div className="space-y-6" data-testid="site-settings">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Ayarları</h1>
        <p className="text-gray-600">Sitenizin tüm ayarlarını buradan yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#78BE20] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-8"
        >
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                    <img src={formData.logo_url} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Üst Bar Mesajı</label>
                <input
                  type="text"
                  value={formData.topbar_message}
                  onChange={(e) => setFormData({ ...formData, topbar_message: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="🚚 Kargo Ücretsizdir!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Numarası</label>
                <input
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="+90 542 140 07 55"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Telefon</label>
                  <input
                    type="text"
                    value={formData.footer_phone}
                    onChange={(e) => setFormData({ ...formData, footer_phone: e.target.value })}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="+90 542 140 07 55"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer E-posta</label>
                  <input
                    type="email"
                    value={formData.footer_email}
                    onChange={(e) => setFormData({ ...formData, footer_email: e.target.value })}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="info@herbalife.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Hakkımızda</label>
                <textarea
                  value={formData.footer_about}
                  onChange={(e) => setFormData({ ...formData, footer_about: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                  placeholder="Sağlıklı yaşamınız için doğru adres"
                />
              </div>
            </div>
          )}

          {/* Popup Tab */}
          {activeTab === 'popup' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.popup_enabled}
                    onChange={(e) => setFormData({ ...formData, popup_enabled: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="popup-enabled-checkbox"
                  />
                  <label className="text-sm font-medium text-yellow-800">
                    🔔 Giriş Popup'ını Aktif Et
                  </label>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  Aktif edildiğinde site ilk açıldığında popup gösterilir
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popup Başlığı</label>
                <input
                  type="text"
                  value={formData.popup_title}
                  onChange={(e) => setFormData({ ...formData, popup_title: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="Hoş Geldiniz!"
                  data-testid="popup-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popup Görseli</label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'popup_image_url')}
                    className="hidden"
                    id="popup-image-upload"
                  />
                  <label
                    htmlFor="popup-image-upload"
                    className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploading ? 'border-[#78BE20] bg-[#78BE20]/5' : 'border-gray-300 hover:border-[#78BE20]'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#78BE20]" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        <span>Resim Yükle</span>
                      </>
                    )}
                  </label>
                  <input
                    type="url"
                    value={formData.popup_image_url}
                    onChange={(e) => setFormData({ ...formData, popup_image_url: e.target.value })}
                    className="flex-1 h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="veya URL girin"
                  />
                </div>
                {formData.popup_image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                    <img src={formData.popup_image_url} alt="Popup" className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popup İçeriği</label>
                <textarea
                  value={formData.popup_content}
                  onChange={(e) => setFormData({ ...formData, popup_content: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                  placeholder="Popup'ta gösterilecek mesaj..."
                  data-testid="popup-content-input"
                />
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firma Adı</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="Herbalife Türkiye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firma Adresi</label>
                <textarea
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                  placeholder="İstanbul, Türkiye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
                <input
                  type="text"
                  value={formData.company_tax_number}
                  onChange={(e) => setFormData({ ...formData, company_tax_number: e.target.value })}
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                  placeholder="1234567890"
                />
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İade & Değişim Politikası
                </label>
                <textarea
                  value={formData.return_policy}
                  onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                  rows={8}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3 font-mono text-sm"
                  placeholder="İade ve değişim koşullarınızı buraya yazın..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesafeli Satış Sözleşmesi
                </label>
                <textarea
                  value={formData.sales_agreement}
                  onChange={(e) => setFormData({ ...formData, sales_agreement: e.target.value })}
                  rows={8}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3 font-mono text-sm"
                  placeholder="Mesafeli satış sözleşmenizi buraya yazın..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KVKK & Gizlilik Politikası
                </label>
                <textarea
                  value={formData.privacy_policy}
                  onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
                  rows={8}
                  className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3 font-mono text-sm"
                  placeholder="KVKK ve gizlilik politikanızı buraya yazın..."
                />
              </div>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            data-testid="save-settings-button"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default SiteSettings;
