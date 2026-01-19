import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Image as ImageIcon, FileText, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BannersManagement = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    active: true,
    is_blog: false,
    blog_content: '',
    blog_images: [],
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/banners`, config);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleFileUpload = async (e, isMainImage = true) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Geçersiz dosya tipi', { description: 'Sadece JPG, PNG, WebP ve GIF dosyaları yüklenebilir' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya çok büyük', { description: 'Maksimum dosya boyutu 10MB' });
      return;
    }

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

      if (isMainImage) {
        setFormData({ ...formData, image_url: response.data.url });
      } else {
        setFormData({ 
          ...formData, 
          blog_images: [...formData.blog_images, response.data.url] 
        });
      }
      toast.success('Resim yüklendi!');
    } catch (error) {
      toast.error('Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const removeBlogImage = (index) => {
    const newImages = [...formData.blog_images];
    newImages.splice(index, 1);
    setFormData({ ...formData, blog_images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const data = {
        ...formData,
        blog_content: formData.is_blog ? formData.blog_content : null,
        blog_images: formData.is_blog ? formData.blog_images : [],
      };

      if (editingBanner) {
        await axios.put(`${API}/banners/${editingBanner.id}`, data, config);
        toast.success('Banner güncellendi');
      } else {
        await axios.post(`${API}/banners`, data, config);
        toast.success('Banner eklendi');
      }

      fetchBanners();
      handleCloseModal();
    } catch (error) {
      toast.error('İşlem başarısız', { description: error.response?.data?.detail });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Banner\'ı silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API}/banners/${id}`, config);
      toast.success('Banner silindi');
      fetchBanners();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      active: banner.active,
      is_blog: banner.is_blog || false,
      blog_content: banner.blog_content || '',
      blog_images: banner.blog_images || [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({ 
      title: '', 
      description: '', 
      image_url: '', 
      link_url: '', 
      active: true,
      is_blog: false,
      blog_content: '',
      blog_images: [],
    });
  };

  return (
    <div className="space-y-6" data-testid="banners-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner / Blog Yönetimi</h1>
          <p className="text-gray-600">{banners.length} içerik</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          data-testid="add-banner-button"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            data-testid={`banner-item-${index}`}
          >
            <div className="relative">
              <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover" />
              {/* Type Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                banner.is_blog 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                {banner.is_blog ? (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Blog
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Banner
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{banner.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid={`edit-banner-${index}`}
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`delete-banner-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
              {banner.is_blog && banner.blog_content && (
                <p className="text-xs text-blue-600 mt-2">
                  {banner.blog_content.length} karakter içerik
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Henüz banner eklenmemiş</p>
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
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              data-testid="banner-modal"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? 'Düzenle' : 'Yeni Ekle'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Blog Toggle */}
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_blog}
                      onChange={(e) => setFormData({ ...formData, is_blog: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      data-testid="banner-is-blog-checkbox"
                    />
                    <label className="text-sm font-medium text-blue-700">
                      📝 Blog Yazısı Olarak Kullan
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    İşaretlerseniz banner'a tıklandığında blog sayfası açılır
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="Banner/Blog başlığı"
                    data-testid="banner-title-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={2}
                    className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                    placeholder="Banner altında görünecek kısa açıklama"
                    data-testid="banner-description-input"
                  />
                </div>

                {/* Main Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Görseli</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                      id="banner-main-image"
                    />
                    <label
                      htmlFor="banner-main-image"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploading ? 'border-[#78BE20] bg-[#78BE20]/5' : 'border-gray-300 hover:border-[#78BE20]'
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-[#78BE20] animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Kapak Resmi Yükle</span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {/* URL alternative */}
                  <div className="mt-2">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full h-10 rounded-lg border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 text-sm"
                      placeholder="veya URL girin"
                    />
                  </div>

                  {formData.image_url && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
                      <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>

                {/* Blog Content (if is_blog) */}
                {formData.is_blog && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blog İçeriği</label>
                      <textarea
                        value={formData.blog_content}
                        onChange={(e) => setFormData({ ...formData, blog_content: e.target.value })}
                        rows={8}
                        className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                        placeholder="Blog yazınızı buraya yazın. Paragraflar için boş satır bırakabilirsiniz..."
                        data-testid="banner-blog-content-input"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.blog_content.length} karakter</p>
                    </div>

                    {/* Blog Gallery Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blog Görselleri (Galeri)</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                        id="banner-blog-images"
                      />
                      <label
                        htmlFor="banner-blog-images"
                        className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#78BE20] transition-all"
                      >
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm">Galeri Resmi Ekle</span>
                        </div>
                      </label>

                      {formData.blog_images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {formData.blog_images.map((img, index) => (
                            <div key={index} className="relative">
                              <img src={img} alt={`Gallery ${index}`} className="w-full h-20 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeBlogImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Link URL (if not blog) */}
                {!formData.is_blog && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (opsiyonel)</label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                      placeholder="https://..."
                      data-testid="banner-link-input"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="banner-active-checkbox"
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
                    disabled={uploading}
                    className="flex-1 bg-[#78BE20] hover:bg-[#65A318] text-white py-3 rounded-full font-bold transition-colors disabled:opacity-50"
                    data-testid="save-banner-button"
                  >
                    {editingBanner ? 'Güncelle' : 'Ekle'}
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

export default BannersManagement;
