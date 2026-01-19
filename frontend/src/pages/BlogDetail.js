import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${API}/banners/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog yazısı bulunamadı');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog?.title,
        text: blog?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
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

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <div className="pt-36 text-center">
          <p className="text-gray-500 text-lg">Blog yazısı bulunamadı</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-[#78BE20] hover:underline"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />
      
      <div className="pt-36 pb-20">
        {/* Hero Image */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold text-white mb-4"
                data-testid="blog-title"
              >
                {blog.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-white/80"
              >
                {blog.description}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Meta & Actions */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#78BE20] transition-colors"
                data-testid="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Geri Dön</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(blog.created_at)}</span>
              </div>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#78BE20] transition-colors"
              data-testid="share-button"
            >
              <Share2 className="w-5 h-5" />
              <span>Paylaş</span>
            </button>
          </div>

          {/* Blog Content */}
          {blog.blog_content ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg max-w-none"
              data-testid="blog-content"
            >
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: blog.blog_content.replace(/\n/g, '<br/>') }}
              />
            </motion.div>
          ) : (
            <p className="text-gray-500 text-center py-8">İçerik henüz eklenmemiş.</p>
          )}

          {/* Blog Images */}
          {blog.blog_images && blog.blog_images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-900">Galeri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blog.blog_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${blog.title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-gradient-to-r from-[#78BE20] to-[#65A318] rounded-3xl p-8 md:p-12 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Sağlıklı Yaşam İçin İlk Adımı Atın
            </h3>
            <p className="text-white/90 mb-6">
              Ürünlerimizi keşfedin ve sağlıklı yaşam yolculuğunuza başlayın.
            </p>
            <button
              onClick={() => navigate('/#products')}
              className="bg-white text-[#78BE20] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              data-testid="view-products-btn"
            >
              Ürünleri Keşfet
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
