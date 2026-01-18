import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { Play, ShoppingBag, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [siteSettings, setSiteSettings] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [videosRes, bannersRes, productsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API}/videos`),
        axios.get(`${API}/banners`),
        axios.get(`${API}/products`),
        axios.get(`${API}/testimonials`),
      ]);
      setVideos(videosRes.data);
      setBanners(bannersRes.data);
      setProducts(productsRes.data);
      setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\S*[?&]v=))([\w-]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&mute=1&controls=1&rel=0&loop=1&playlist=${videoId[1]}` : '';
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Ürün sepete eklendi!', {
      description: product.name,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FCF8]">
      <TopBar />
      <Navbar />

      {/* Hero Video Slider */}
      <section className="pt-20 relative" data-testid="hero-section">
        <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          {videos.length > 0 ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10" />
              <iframe
                src={getYouTubeEmbedUrl(videos[currentVideoIndex]?.youtube_url)}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                data-testid="hero-video-iframe"
              />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-7xl mx-auto"
                >
                  <h1
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-none"
                    data-testid="hero-title"
                  >
                    {videos[currentVideoIndex]?.title || 'Sağlıklı Yaşam Başlıyor'}
                  </h1>
                  <motion.button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-[#78BE20] hover:bg-[#65A318] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid="hero-cta-button"
                  >
                    Ürünleri Keşfedin
                  </motion.button>
                </motion.div>
              </div>
              {videos.length > 1 && (
                <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentVideoIndex ? 'bg-[#78BE20] w-8' : 'bg-white/50'
                      }`}
                      data-testid={`video-indicator-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#78BE20]/20 to-[#F9FCF8] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8"
              >
                <Sparkles className="w-16 h-16 text-[#78BE20] mx-auto mb-4" />
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
                  Sağlıklı Yaşamınızı <br />
                  <span className="text-[#78BE20]">Dönüştürün</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">Premium Herbalife ürünleriyle hayalinizdeki forma ulaşın</p>
                <motion.button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#78BE20] hover:bg-[#65A318] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ürünleri Keşfedin
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Campaign Banners */}
      {banners.length > 0 && (
        <section className="py-12 md:py-16" data-testid="banners-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer h-64"
                  onClick={() => banner.link_url && window.open(banner.link_url, '_blank')}
                  data-testid={`banner-${index}`}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h3>
                    <p className="text-white/90">{banner.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section id="products" className="py-20 md:py-32" data-testid="products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ürünlerimiz ve <span className="text-[#78BE20]">Paketlerimiz</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sağlıklı yaşam yolculuğunuzda yanınızdaki ürünler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-[#78BE20]/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                data-testid={`product-card-${index}`}
              >
                <div
                  className="relative h-64 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.is_package && (
                    <div className="absolute top-4 right-4 bg-[#78BE20] text-white px-3 py-1 rounded-full text-sm font-bold">
                      Paket
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#78BE20]">
                      ₺{product.price.toFixed(2)}
                    </span>
                    <motion.button
                      onClick={() => handleAddToCart(product)}
                      className="bg-black hover:bg-[#78BE20] text-white rounded-full p-3 transition-all duration-300 group-hover:scale-110"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`add-to-cart-${index}`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz ürün eklenmemiş.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 md:py-32 bg-[#F9FCF8]" data-testid="testimonials-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Müşteri <span className="text-[#78BE20]">Yorumları</span>
              </h2>
              <p className="text-lg text-gray-600">Müşterilerimizin deneyimlerini dinleyin</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 6).map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  data-testid={`testimonial-${index}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#78BE20]/20 flex items-center justify-center text-[#78BE20] font-bold text-xl">
                      {testimonial.customer_name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{testimonial.customer_name}</h4>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{testimonial.comment}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4">
                <span className="text-[#78BE20]">Herba</span>Life
              </h3>
              <p className="text-gray-400">Sağlıklı yaşamınız için doğru adres</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#products" className="text-gray-400 hover:text-[#78BE20] transition-colors">
                    Ürünler
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-[#78BE20] transition-colors">
                    Yorumlar
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Bize Ulaşın</h4>
              <p className="text-gray-400">WhatsApp: +90 542 140 07 55</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HerbaLife. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;