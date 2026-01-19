import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/reviews`, config);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const updateReviewStatus = async (reviewId, approved) => {
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(`${API}/reviews/${reviewId}`, { approved }, config);
      toast.success(approved ? 'Yorum onaylandı' : 'Yorum reddedildi');
      fetchReviews();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Yorumu silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API}/reviews/${reviewId}`, config);
      toast.success('Yorum silindi');
      fetchReviews();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.approved;
    if (filter === 'approved') return review.approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <div className="space-y-6" data-testid="reviews-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Yorumları</h1>
          <p className="text-gray-600">
            {reviews.length} yorum, {pendingCount} onay bekliyor
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'pending', label: `Bekleyenler (${pendingCount})` },
          { id: 'approved', label: 'Onaylananlar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.id
                ? 'bg-[#78BE20] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border p-6 ${
                review.approved ? 'border-green-200' : 'border-yellow-200'
              }`}
              data-testid={`review-item-${index}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#78BE20]/10 flex items-center justify-center text-[#78BE20] font-bold">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                      <div className="flex items-center gap-2">
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
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          review.approved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.approved ? 'Onaylandı' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.image_url && (
                    <div className="mb-3">
                      <img
                        src={review.image_url}
                        alt="Review"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {!review.approved && (
                    <button
                      onClick={() => updateReviewStatus(review.id, true)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      title="Onayla"
                      data-testid={`approve-review-${index}`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => updateReviewStatus(review.id, false)}
                      className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                      title="Onayı Kaldır"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    title="Sil"
                    data-testid={`delete-review-${index}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'pending' ? 'Bekleyen yorum yok' : 'Henüz yorum yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsManagement;
