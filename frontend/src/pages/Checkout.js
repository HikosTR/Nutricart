import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'sonner';
import { CreditCard, User, MapPin, Phone, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_iban: '',
    receipt_file_url: '',
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(response.data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPG, PNG ve PDF dosyaları yüklenebilir');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setSelectedFile(file);
    setUploadingFile(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await axios.post(`${API}/upload`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData({ ...formData, receipt_file_url: response.data.file_url });
      toast.success('Dosya başarıyla yüklendi!');
    } catch (error) {
      toast.error('Dosya yüklenirken hata oluştu');
      setSelectedFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.receipt_file_url) {
      toast.error('Lütfen ödeme dekontunu yükleyin');
      return;
    }
    
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: getCartTotal(),
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      toast.success('Siparişiniz alındı!', {
        description: 'Sipariş takip sayfasına yönlendiriliyorsunuz...',
      });
      
      clearCart();
      setTimeout(() => {
        navigate(`/order/${response.data.id}`);
      }, 1500);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Sipariş oluşturulurken hata oluştu', {
        description: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" data-testid="checkout-title">
              Ödeme Bilgileri
            </h1>
            <p className="text-gray-600">Siparişinizi tamamlamak için bilgilerinizi girin</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <User className="w-6 h-6 text-[#78BE20]" />
                    <span>Kişisel Bilgiler</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white px-4"
                        placeholder="Adınız Soyadınız"
                        data-testid="customer-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        required
                        className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white px-4"
                        placeholder="ornek@email.com"
                        data-testid="customer-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white px-4"
                      placeholder="0555 555 55 55"
                      data-testid="customer-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teslimat Adresi *
                    </label>
                    <textarea
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white px-4 py-3"
                      placeholder="Mahalle, Sokak, Bina No, Daire No, İlçe, Şehir"
                      data-testid="customer-address-input"
                    />
                  </div>
                </div>

                <div className="bg-[#F9FCF8] border border-[#78BE20]/20 rounded-2xl p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <CreditCard className="w-6 h-6 text-[#78BE20]" />
                    <span>Ödeme Bilgileri</span>
                  </h2>
                  
                  <div className="bg-white rounded-xl p-6 border-2 border-[#78BE20]">
                    <p className="text-sm text-gray-600 mb-4">
                      Ödeme yöntemi olarak <span className="font-bold text-[#78BE20]">Banka Havalesi / EFT</span> kullanmaktayız.
                      Lütfen ödemenizi aşağıdaki hesaba yapın ve dekont görselini yükleyin.
                    </p>
                    
                    {paymentSettings && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Hesap Sahibi</p>
                        <p className="font-bold text-gray-900 mb-3">{paymentSettings.account_holder_name}</p>
                        
                        <p className="text-xs text-gray-500 mb-1">IBAN</p>
                        <p className="font-mono font-bold text-gray-900 mb-3">{paymentSettings.iban}</p>
                        
                        {paymentSettings.bank_name && (
                          <>
                            <p className="text-xs text-gray-500 mb-1">Banka</p>
                            <p className="font-bold text-gray-900">{paymentSettings.bank_name}</p>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Dekontu Yükle *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#78BE20] transition-colors">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="receipt-upload"
                          disabled={uploadingFile}
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="cursor-pointer"
                        >
                          {uploadingFile ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#78BE20] border-t-transparent mb-2" />
                              <p className="text-sm text-gray-600">Yükleniyor...</p>
                            </div>
                          ) : selectedFile ? (
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Dosya yüklendi ✓</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm font-medium text-gray-900 mb-1">Dekont dosyası yükleyin</p>
                              <p className="text-xs text-gray-500">JPG, PNG veya PDF (Max 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {!formData.receipt_file_url && (
                        <p className="text-xs text-red-500 mt-2">* Ödeme dekontu yüklemek zorunludur</p>
                      )}
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  data-testid="complete-order-button"
                >
                  {loading ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla'}
                </motion.button>
              </motion.form>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="bg-[#F9FCF8] rounded-3xl p-8 space-y-6" data-testid="checkout-summary">
                <h2 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h2>
                
                <div className="space-y-4 border-b border-gray-200 pb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-bold">₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-b border-gray-200 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>₺{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className="text-[#78BE20] font-bold">Ücretsiz</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-black">
                  <span>Toplam</span>
                  <span className="text-[#78BE20]" data-testid="checkout-total">₺{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;