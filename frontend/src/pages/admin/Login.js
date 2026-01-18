import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem('admin_token', response.data.token);
      toast.success(isRegister ? 'Kayıt başarılı!' : 'Giriş başarılı!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(isRegister ? 'Kayıt başarısız' : 'Giriş başarısız', {
        description: error.response?.data?.detail || 'Lütfen bilgilerinizi kontrol edin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F9FCF8] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">
            <span className="text-[#78BE20]">Herba</span>
            <span className="text-black">Life</span>
          </h1>
          <p className="text-gray-600">Admin Paneli</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 ${
                !isRegister ? 'bg-[#78BE20] text-white' : 'text-gray-600'
              }`}
              data-testid="login-tab"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 ${
                isRegister ? 'bg-[#78BE20] text-white' : 'text-gray-600'
              }`}
              data-testid="register-tab"
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white pl-12 pr-4"
                  placeholder="admin@example.com"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 bg-white pl-12 pr-4"
                  placeholder="••••••••"
                  data-testid="password-input"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-[#78BE20] hover:bg-[#65A318] text-white py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              data-testid="submit-button"
            >
              {loading ? 'Yükleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-[#78BE20] text-sm transition-colors"
              data-testid="back-to-site-button"
            >
              ← Siteye Dön
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;