import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SliderManagement = () => {
  const [slides, setSlides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'video',
    youtube_url: '',
    image_url: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/videos`, config);
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const data = {
        title: formData.title,
        media_type: formData.media_type,
        youtube_url: formData.media_type === 'video' ? formData.youtube_url : null,
        image_url: formData.media_type === 'image' ? formData.image_url : null,
        order: parseInt(formData.order),
        active: formData.active,
      };

      if (editingSlide) {
        await axios.put(`${API}/videos/${editingSlide.id}`, data, config);
        toast.success('Slider güncellendi');
      } else {
        await axios.post(`${API}/videos`, data, config);
        toast.success('Slider eklendi');
      }

      fetchSlides();
      handleCloseModal();
    } catch (error) {
      toast.error('İşlem başarısız', { description: error.response?.data?.detail });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu slider öğesini silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API}/videos/${id}`, config);
      toast.success('Slider silindi');
      fetchSlides();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      media_type: slide.media_type || 'video',
      youtube_url: slide.youtube_url || '',
      image_url: slide.image_url || '',
      order: slide.order,
      active: slide.active,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      media_type: 'video',
      youtube_url: '',
      image_url: '',
      order: 0,
      active: true,
    });
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\S*[?&]v=))([\w-]{11})/);
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg` : null;
  };

  return (
    <div className="space-y-6" data-testid="slider-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Slider Yönetimi</h1>
          <p className="text-gray-600">{slides.length} öğe (Video veya Resim)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          data-testid="add-slide-button"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            data-testid={`slide-item-${index}`}
          >
            {/* Preview */}
            <div className="relative h-40 bg-gray-100">
              {slide.media_type === 'image' && slide.image_url ? (
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : slide.youtube_url ? (
                <img
                  src={getYouTubeThumbnail(slide.youtube_url)}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
              
              {/* Type Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                slide.media_type === 'image' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {slide.media_type === 'image' ? (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Resim
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <VideoIcon className="w-3 h-3" /> Video
                  </span>
                )}
              </div>
              
              {/* Order Badge */}
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-bold">
                Sıra: {slide.order}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{slide.title}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {slide.media_type === 'image' ? slide.image_url : slide.youtube_url}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid={`edit-slide-${index}`}
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`delete-slide-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Henüz slider öğesi eklenmemiş</p>
          <p className="text-gray-400 text-sm mt-2">Video veya resim ekleyerek başlayın</p>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              data-testid="slide-modal"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSlide ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Media Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medya Tipi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, media_type: 'video' })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.media_type === 'video'
                          ? 'border-[#78BE20] bg-[#78BE20]/10 text-[#78BE20]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <VideoIcon className="w-6 h-6" />
                      <span className="font-medium">Video</span>
                      <span className="text-xs text-gray-500">YouTube URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, media_type: 'image' })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.media_type === 'image'
                          ? 'border-[#78BE20] bg-[#78BE20]/10 text-[#78BE20]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="font-medium">Resim</span>
                      <span className="text-xs text-gray-500">Resim URL</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="Slider başlığı"
                    data-testid="slide-title-input"
                  />
                </div>

                {formData.media_type === 'video' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      required={formData.media_type === 'video'}
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                      placeholder="https://www.youtube.com/watch?v=..."
                      data-testid="slide-youtube-input"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resim URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required={formData.media_type === 'image'}
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                      placeholder="https://example.com/image.jpg"
                      data-testid="slide-image-input"
                    />
                    {formData.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-40 object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sıra</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="slide-order-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Düşük sayı önce gösterilir</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="slide-active-checkbox"
                  />
                  <label className="text-sm font-medium text-gray-700">Aktif (Sitede göster)</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-bold transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#78BE20] hover:bg-[#65A318] text-white py-3 rounded-full font-bold transition-colors"
                    data-testid="save-slide-button"
                  >
                    {editingSlide ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SliderManagement;
