import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_image: '',
    rating: 5,
    comment: '',
    active: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/testimonials`, config);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const data = { ...formData, rating: parseInt(formData.rating) };

      if (editingTestimonial) {
        await axios.put(`${API}/testimonials/${editingTestimonial.id}`, data, config);
        toast.success('Yorum güncellendi');
      } else {
        await axios.post(`${API}/testimonials`, data, config);
        toast.success('Yorum eklendi');
      }

      fetchTestimonials();
      handleCloseModal();
    } catch (error) {
      toast.error('İşlem başarısız', { description: error.response?.data?.detail });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yorumu silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API}/testimonials/${id}`, config);
      toast.success('Yorum silindi');
      fetchTestimonials();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customer_name: testimonial.customer_name,
      customer_image: testimonial.customer_image || '',
      rating: testimonial.rating,
      comment: testimonial.comment,
      active: testimonial.active,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({ customer_name: '', customer_image: '', rating: 5, comment: '', active: true });
  };

  return (
    <div className="space-y-6" data-testid="testimonials-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yorum Yönetimi</h1>
          <p className="text-gray-600">{testimonials.length} yorum</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          data-testid="add-testimonial-button"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Yorum</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            data-testid={`testimonial-item-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#78BE20]/10 flex items-center justify-center text-[#78BE20] font-bold">
                  {testimonial.customer_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.customer_name}</h3>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid={`edit-testimonial-${index}`}
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  data-testid={`delete-testimonial-${index}`}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{testimonial.comment}</p>
          </motion.div>
        ))}
      </div>

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
              className="bg-white rounded-3xl p-8 max-w-lg w-full"
              data-testid="testimonial-modal"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTestimonial ? 'Yorum Düzenle' : 'Yeni Yorum Ekle'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri Adı</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="testimonial-name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Puan (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="testimonial-rating-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yorum</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    required
                    rows={4}
                    className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                    data-testid="testimonial-comment-input"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="testimonial-active-checkbox"
                  />
                  <label className="text-sm font-medium text-gray-700">Aktif</label>
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
                    data-testid="save-testimonial-button"
                  >
                    {editingTestimonial ? 'Güncelle' : 'Ekle'}
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

export default TestimonialsManagement;