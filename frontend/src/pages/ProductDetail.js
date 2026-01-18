import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { ShoppingCart, ArrowLeft, Package, Star } from 'lucide-react';
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
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
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
      </div>
    </div>
  );
};

export default ProductDetail;