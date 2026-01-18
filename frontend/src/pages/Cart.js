import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success('Ürün sepetten çıkarıldı', { description: productName });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
              data-testid="empty-cart"
            >
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-8">Ürün eklemek için alışverişe başlayın</p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#78BE20] hover:bg-[#65A318] text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                data-testid="continue-shopping-button"
              >
                Alışverişe Başla
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" data-testid="cart-title">
              Alışveriş Sepetim
            </h1>
            <p className="text-gray-600">{cart.length} ürün</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  data-testid={`cart-item-${index}`}
                >
                  <div className="flex items-center space-x-6">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          data-testid={`decrease-quantity-${index}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold" data-testid={`item-quantity-${index}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          data-testid={`increase-quantity-${index}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#78BE20]" data-testid={`item-total-${index}`}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">₺{item.price.toFixed(2)} / adet</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="bg-[#F9FCF8] rounded-3xl p-8 space-y-6" data-testid="cart-summary">
                <h2 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h2>
                
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
                  <span className="text-[#78BE20]" data-testid="cart-total">₺{getCartTotal().toFixed(2)}</span>
                </div>

                <motion.button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="proceed-to-checkout-button"
                >
                  <span>Ödemeye Geç</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-full font-bold border-2 border-gray-200 transition-all duration-300"
                  data-testid="continue-shopping-button-summary"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;