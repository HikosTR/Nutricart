import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { ShoppingCart, ArrowLeft, Package, Star, Send, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    image_url: '',
  });
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      if (response.data.has_variants && response.data.variants && response.data.variants.length > 0) {
        setSelectedVariant(response.data.variants[0].name);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Ürün yüklenirken hata oluştu');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReviewForm({ ...reviewForm, image_url: response.data.url });
      toast.success('Resim yüklendi!');
    } catch (error) {
      toast.error('Resim yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.customer_name.trim() || !reviewForm.comment.trim()) {
      toast.error('Lütfen adınızı ve yorumunuzu girin');
      return;
    }

    try {
      await axios.post(`${API}/reviews`, {
        product_id: id,
        ...reviewForm,
      });
      toast.success('Yorumunuz gönderildi! Onaylandıktan sonra görünecektir.');
      setReviewForm({ customer_name: '', rating: 5, comment: '', image_url: '' });
      setShowReviewForm(false);
    } catch (error) {
      toast.error('Yorum gönderilemedi');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (product.has_variants && !selectedVariant) {
        toast.error('Lütfen bir aroma seçin');
        return;
      }
      
      let variantImageUrl = product.image_url;
      if (product.has_variants && selectedVariant) {
        const variant = product.variants.find(v => v.name === selectedVariant);
        variantImageUrl = variant?.image_url || product.image_url;
      }
      
      const productToAdd = {
        ...product,
        selectedVariant: selectedVariant,
        displayName: selectedVariant ? `${product.name} - ${selectedVariant}` : product.name,
        image_url: variantImageUrl,
      };
      
      addToCart(productToAdd, quantity);
      toast.success('Ürün sepete eklendi!', {
        description: `${quantity} adet ${productToAdd.displayName}`,
      });
    }
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.has_variants && selectedVariant) {
      const variant = product.variants.find(v => v.name === selectedVariant);
      return variant ? variant.stock : 0;
    }
    return product.stock;
  };

  const getCurrentImage = () => {
    if (!product) return '';
    if (product.has_variants && selectedVariant) {
      const variant = product.variants.find(v => v.name === selectedVariant);
      return variant?.image_url || product.image_url;
    }
    return product.image_url;
  };

  if (!product) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-[#78BE20] mb-8 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="sticky top-32">
                <div className="relative rounded-3xl overflow-hidden bg-gray-50">
                  <motion.img
                    key={getCurrentImage()}
                    src={getCurrentImage()}
                    alt={product.name}
                    className="w-full h-[500px] object-cover"
                    data-testid="product-detail-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {product.is_package && (
                    <div className="absolute top-6 right-6 bg-[#78BE20] text-white px-4 py-2 rounded-full font-bold flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Paket</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" data-testid="product-detail-name">
                  {product.name}
                </h1>
                <p className="text-gray-600 leading-relaxed text-lg" data-testid="product-detail-description">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(5.0)</span>
              </div>

              <div className="bg-[#F9FCF8] rounded-2xl p-6">
                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-5xl font-black text-[#78BE20]" data-testid="product-detail-price">
                    ₺{product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">/ Adet</span>
                </div>
                <p className="text-sm text-gray-600">
                  Stok Durumu: <span className="text-[#78BE20] font-bold">{getAvailableStock()} adet</span>
                </p>
              </div>

              {product.has_variants && product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Aroma Seçin</label>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.name}
                        onClick={() => variant.is_available && variant.stock > 0 && setSelectedVariant(variant.name)}
                        disabled={!variant.is_available || variant.stock <= 0}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                          selectedVariant === variant.name
                            ? 'border-[#78BE20] bg-[#78BE20]/10 text-[#78BE20]'
                            : (!variant.is_available || variant.stock <= 0)
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-[#78BE20]/50'
                        }`}
                        data-testid={`variant-${variant.name}`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{variant.name}</div>
                          {(!variant.is_available || variant.stock <= 0) ? (
                            <div className="text-xs text-red-500 mt-1">TÜKENDİ</div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1">Stok: {variant.stock}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adet</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors"
                      data-testid="decrease-quantity-button"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold w-12 text-center" data-testid="quantity-display">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors"
                      data-testid="increase-quantity-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Sepete Ekle</span>
                </motion.button>

                <button
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => navigate('/cart'), 300);
                  }}
                  className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-full font-bold text-lg transition-all duration-300"
                  data-testid="buy-now-button"
                >
                  Hemen Al
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-[#78BE20]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#78BE20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Orijinal ürün garantisi</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-[#78BE20]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#78BE20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Hızlı kargo</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-[#78BE20]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#78BE20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Güvenli ödeme</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Müşteri Yorumları ({reviews.length})
              </h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                data-testid="write-review-button"
              >
                Yorum Yaz
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReview}
                className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4"
                data-testid="review-form"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adınız</label>
                  <input
                    type="text"
                    value={reviewForm.customer_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yorumunuz</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                    placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fotoğraf Ekle (Opsiyonel)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReviewImageUpload}
                      className="hidden"
                      id="review-image-upload"
                    />
                    <label
                      htmlFor="review-image-upload"
                      className={`flex items-center px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploading ? 'border-[#78BE20]' : 'border-gray-300 hover:border-[#78BE20]'
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
                    {reviewForm.image_url && (
                      <div className="relative">
                        <img src={reviewForm.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, image_url: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-full font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#78BE20] hover:bg-[#65A318] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Gönder
                  </button>
                </div>
              </motion.form>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 pb-6 last:border-0"
                    data-testid={`review-item-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#78BE20]/10 flex items-center justify-center text-[#78BE20] font-bold text-lg">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{review.comment}</p>
                        {review.image_url && (
                          <img
                            src={review.image_url}
                            alt="Review"
                            className="w-32 h-32 object-cover rounded-xl"
                          />
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(review.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Henüz yorum yapılmamış</p>
                <p className="text-sm text-gray-400">İlk yorumu siz yapın!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;