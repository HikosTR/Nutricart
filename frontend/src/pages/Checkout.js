import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [cardPaymentStatus, setCardPaymentStatus] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('eft'); // 'eft', 'iyzico', 'paytr'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [threeDSContent, setThreeDSContent] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    receipt_file_url: '',
  });

  const [cardData, setCardData] = useState({
    card_holder_name: '',
    card_number: '',
    expire_month: '',
    expire_year: '',
    cvc: '',
    installment: 1,
  });

  useEffect(() => {
    const storedCart = localStorage.getItem('herbalife_cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (parsedCart.length === 0) {
        navigate('/sepet');
      }
      setCart(parsedCart);
    } else {
      navigate('/sepet');
    }
    fetchPaymentSettings();
    fetchCardPaymentStatus();
  }, [navigate]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(response.data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchCardPaymentStatus = async () => {
    try {
      const response = await axios.get(`${API}/card-payment/status`);
      setCardPaymentStatus(response.data);
    } catch (error) {
      console.error('Error fetching card payment status:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
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

    setUploadingFile(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, receipt_file_url: response.data.file_url });
      setSelectedFile(file);
      toast.success('Dekont başarıyla yüklendi');
    } catch (error) {
      toast.error('Dosya yüklenemedi', { description: error.response?.data?.detail });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitEFT = async (e) => {
    e.preventDefault();
    
    if (!formData.receipt_file_url) {
      toast.error('Lütfen ödeme dekontunu yükleyin');
      return;
    }

    setLoading(true);
    
    const orderData = {
      ...formData,
      items: cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant: item.selectedVariant || null
      })),
      total_amount: getCartTotal(),
      payment_method: 'eft'
    };

    try {
      const response = await axios.post(`${API}/orders`, orderData);
      localStorage.removeItem('herbalife_cart');
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      navigate(`/siparis-takip/${response.data.order_code}`);
    } catch (error) {
      toast.error('Sipariş oluşturulamadı', { description: error.response?.data?.detail });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCard = async (provider) => {
    // Validate form
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_address) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (provider === 'iyzico') {
      if (!cardData.card_holder_name || !cardData.card_number || !cardData.expire_month || !cardData.expire_year || !cardData.cvc) {
        toast.error('Lütfen kart bilgilerini doldurun');
        return;
      }
    }

    setCardProcessing(true);
    
    const orderId = `ORD-${Date.now()}`;
    
    const paymentData = {
      order_id: orderId,
      payment_provider: provider,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      total_amount: getCartTotal(),
      items: cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant: item.selectedVariant || null
      })),
      ...(provider === 'iyzico' && {
        card_holder_name: cardData.card_holder_name,
        card_number: cardData.card_number.replace(/\s/g, ''),
        expire_month: cardData.expire_month,
        expire_year: cardData.expire_year,
        cvc: cardData.cvc,
        installment: cardData.installment,
      })
    };

    try {
      const endpoint = provider === 'iyzico' ? '/card-payment/init-iyzico' : '/card-payment/init-paytr';
      const response = await axios.post(`${API}${endpoint}`, paymentData);
      
      if (response.data.status === 'redirect') {
        if (provider === 'paytr' && response.data.iframe_token) {
          setIframeUrl(response.data.redirect_url);
        } else if (provider === 'iyzico' && response.data.html_content) {
          setThreeDSContent(response.data.html_content);
        }
      } else if (response.data.status === 'failure') {
        toast.error(response.data.error_message || 'Ödeme başlatılamadı');
      }
    } catch (error) {
      toast.error('Ödeme hatası', { description: error.response?.data?.detail });
    } finally {
      setCardProcessing(false);
    }
  };

  const closePaymentModal = () => {
    setIframeUrl(null);
    setThreeDSContent(null);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Payment Modal (iFrame/3DS) */}
      <AnimatePresence>
        {(iframeUrl || threeDSContent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Güvenli Ödeme</h3>
                <button
                  onClick={closePaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {iframeUrl && (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-[600px] border-0"
                    title="Ödeme Formu"
                  />
                )}
                {threeDSContent && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: threeDSContent }}
                    className="w-full"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black text-gray-900 mb-4" data-testid="checkout-title">Sipariş Tamamla</h1>
            <p className="text-gray-600">Teslimat bilgilerinizi girin ve ödeme yöntemini seçin</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <User className="w-6 h-6 text-[#78BE20]" />
                  <span>Teslimat Bilgileri</span>
                </h2>
                
                <div className="space-y-4">
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
                        placeholder="Ad Soyad"
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
                      rows={3}
                      className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white px-4 py-3"
                      placeholder="Mahalle, Sokak, Bina No, Daire No, İlçe, Şehir"
                      data-testid="customer-address-input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-[#78BE20]" />
                  <span>Ödeme Yöntemi</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* EFT Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('eft')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      selectedPaymentMethod === 'eft'
                        ? 'border-[#78BE20] bg-[#78BE20]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid="payment-eft"
                  >
                    <Banknote className={`w-8 h-8 ${selectedPaymentMethod === 'eft' ? 'text-[#78BE20]' : 'text-gray-400'}`} />
                    <span className="font-bold">Havale / EFT</span>
                    <span className="text-xs text-gray-500">Banka transferi</span>
                  </button>

                  {/* Iyzico Option */}
                  {cardPaymentStatus?.available_providers?.includes('iyzico') && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('iyzico')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        selectedPaymentMethod === 'iyzico'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="payment-iyzico"
                    >
                      <CreditCard className={`w-8 h-8 ${selectedPaymentMethod === 'iyzico' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="font-bold">iyzico</span>
                      <span className="text-xs text-gray-500">Kredi/Banka Kartı</span>
                    </button>
                  )}

                  {/* PayTR Option */}
                  {cardPaymentStatus?.available_providers?.includes('paytr') && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('paytr')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        selectedPaymentMethod === 'paytr'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="payment-paytr"
                    >
                      <CreditCard className={`w-8 h-8 ${selectedPaymentMethod === 'paytr' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="font-bold">PayTR</span>
                      <span className="text-xs text-gray-500">Kredi/Banka Kartı</span>
                    </button>
                  )}

                  {/* Show message if no card payment available */}
                  {!cardPaymentStatus?.card_payment_enabled && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-2 text-gray-400">
                      <CreditCard className="w-8 h-8" />
                      <span className="font-medium text-sm">Kredi Kartı</span>
                      <span className="text-xs">Şu an kullanılamıyor</span>
                    </div>
                  )}
                </div>

                {/* EFT Payment Details */}
                <AnimatePresence mode="wait">
                  {selectedPaymentMethod === 'eft' && (
                    <motion.div
                      key="eft"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#F9FCF8] rounded-xl p-6 border border-[#78BE20]/20">
                        <p className="text-sm text-gray-600 mb-4">
                          Ödeme yöntemi olarak <span className="font-bold text-[#78BE20]">Banka Havalesi / EFT</span> kullanmaktayız.
                          Lütfen ödemenizi aşağıdaki hesaba yapın ve dekont görselini yükleyin.
                        </p>
                        
                        {paymentSettings && (
                          <div className="bg-white rounded-xl p-4 mb-4">
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
                                  <Loader className="w-8 h-8 text-[#78BE20] animate-spin mb-2" />
                                  <p className="text-sm text-gray-600">Yükleniyor...</p>
                                </div>
                              ) : selectedFile ? (
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
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
                        </div>

                        <button
                          onClick={handleSubmitEFT}
                          disabled={loading || !formData.receipt_file_url}
                          className="w-full mt-6 bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          data-testid="complete-eft-order"
                        >
                          {loading ? 'İşleniyor...' : 'Siparişi Tamamla (Havale/EFT)'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Iyzico Card Form */}
                  {selectedPaymentMethod === 'iyzico' && (
                    <motion.div
                      key="iyzico"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-blue-800">iyzico ile Güvenli Ödeme</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kart Üzerindeki İsim *
                            </label>
                            <input
                              type="text"
                              name="card_holder_name"
                              value={cardData.card_holder_name}
                              onChange={handleCardChange}
                              className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4"
                              placeholder="JOHN DOE"
                              data-testid="card-holder-name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kart Numarası *
                            </label>
                            <input
                              type="text"
                              name="card_number"
                              value={cardData.card_number}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                setCardData({ ...cardData, card_number: formatted });
                              }}
                              className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 font-mono"
                              placeholder="1234 5678 9012 3456"
                              data-testid="card-number"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ay *
                              </label>
                              <input
                                type="text"
                                name="expire_month"
                                value={cardData.expire_month}
                                onChange={(e) => setCardData({ ...cardData, expire_month: e.target.value.slice(0, 2) })}
                                className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 text-center font-mono"
                                placeholder="MM"
                                maxLength="2"
                                data-testid="expire-month"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yıl *
                              </label>
                              <input
                                type="text"
                                name="expire_year"
                                value={cardData.expire_year}
                                onChange={(e) => setCardData({ ...cardData, expire_year: e.target.value.slice(0, 2) })}
                                className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 text-center font-mono"
                                placeholder="YY"
                                maxLength="2"
                                data-testid="expire-year"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVC *
                              </label>
                              <input
                                type="password"
                                name="cvc"
                                value={cardData.cvc}
                                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.slice(0, 4) })}
                                className="w-full h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 px-4 text-center font-mono"
                                placeholder="***"
                                maxLength="4"
                                data-testid="cvc"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSubmitCard('iyzico')}
                          disabled={cardProcessing}
                          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="complete-iyzico-order"
                        >
                          {cardProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader className="w-5 h-5 animate-spin" />
                              İşleniyor...
                            </span>
                          ) : (
                            `₺${getCartTotal().toFixed(2)} Öde (iyzico)`
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* PayTR Option */}
                  {selectedPaymentMethod === 'paytr' && (
                    <motion.div
                      key="paytr"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-blue-800">PayTR ile Güvenli Ödeme</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          PayTR'nin güvenli ödeme sayfasına yönlendirileceksiniz. Kart bilgilerinizi orada girebilirsiniz.
                        </p>

                        <button
                          onClick={() => handleSubmitCard('paytr')}
                          disabled={cardProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="complete-paytr-order"
                        >
                          {cardProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader className="w-5 h-5 animate-spin" />
                              Yönlendiriliyor...
                            </span>
                          ) : (
                            `₺${getCartTotal().toFixed(2)} Öde (PayTR)`
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="bg-[#F9FCF8] rounded-3xl p-8 space-y-6" data-testid="checkout-summary">
                <h2 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h2>
                
                <div className="space-y-4 border-b border-gray-200 pb-6">
                  {cart.map((item) => (
                    <div key={item.cartId || item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name}
                        {item.selectedVariant && (
                          <span className="text-[#78BE20] font-medium"> ({item.selectedVariant})</span>
                        )}
                        {' x '}{item.quantity}
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

                {/* Security badges */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>3D Secure</span>
                    </div>
                  </div>
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
