import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Shield,
  User,
  X,
  Save,
  Key,
  Mail,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Admin',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await axios.get(`${API}/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Bu sayfaya erişim yetkiniz yok');
      } else {
        toast.error('Kullanıcılar yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editingAdmin) {
        // Update existing admin
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`${API}/admins/${editingAdmin.id}`, updateData, config);
        toast.success('Kullanıcı güncellendi');
      } else {
        // Create new admin
        await axios.post(`${API}/admins`, formData, config);
        toast.success('Kullanıcı oluşturuldu');
      }
      
      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ email: '', password: '', role: 'Admin' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'İşlem başarısız');
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    
    try {
      await axios.delete(`${API}/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kullanıcı silindi');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Silme işlemi başarısız');
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({ email: '', password: '', role: 'Admin' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#78BE20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600">Admin kullanıcılarını yönetin</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          data-testid="add-user-btn"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                  data-testid={`user-row-${admin.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        admin.role === 'Yönetici' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {admin.role === 'Yönetici' ? (
                          <Shield className={`w-5 h-5 text-purple-600`} />
                        ) : (
                          <User className={`w-5 h-5 text-blue-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{admin.email}</p>
                        <p className="text-sm text-gray-500">ID: {admin.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      admin.role === 'Yönetici'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.role === 'Yönetici' && <Shield className="w-3 h-3 mr-1" />}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(admin.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                        data-testid={`edit-user-${admin.id}`}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                        data-testid={`delete-user-${admin.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Henüz kullanıcı yok</p>
          </div>
        )}
      </div>

      {/* Role Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Rol Açıklamaları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
            <Shield className="w-6 h-6 text-purple-600 mt-0.5" />
            <div>
              <p className="font-bold text-purple-800">Yönetici (Super Admin)</p>
              <p className="text-sm text-purple-600">
                Tüm yetkilere sahiptir. Diğer admin kullanıcıları ekleyebilir, düzenleyebilir ve silebilir.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
            <User className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800">Admin</p>
              <p className="text-sm text-blue-600">
                Standart admin yetkileri. Ürün, sipariş, içerik yönetimi yapabilir. Kullanıcı yönetimi yapamaz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAdmin ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-posta *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="admin@example.com"
                    data-testid="user-email-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    Şifre {editingAdmin ? '(Değiştirmek için doldurun)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingAdmin}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="••••••••"
                    data-testid="user-password-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="user-role-select"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Yönetici">Yönetici (Super Admin)</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#78BE20] hover:bg-[#65A318] text-white font-medium transition-colors flex items-center justify-center space-x-2"
                    data-testid="save-user-btn"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingAdmin ? 'Güncelle' : 'Oluştur'}</span>
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

export default UserManagement;
