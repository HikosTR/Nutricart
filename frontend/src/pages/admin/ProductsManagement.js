import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: 100,
    is_package: false,
    has_variants: false,
    variants: [],
  });
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantStock, setNewVariantStock] = useState(100);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, data, config);
        toast.success('Ürün güncellendi');
      } else {
        await axios.post(`${API}/products`, data, config);
        toast.success('Ürün eklendi');
      }

      fetchProducts();
      handleCloseModal();
    } catch (error) {
      toast.error('İşlem başarısız', { description: error.response?.data?.detail });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ürünü silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API}/products/${id}`, config);
      toast.success('Ürün silindi');
      fetchProducts();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
      is_package: product.is_package,
      has_variants: product.has_variants || false,
      variants: product.variants || [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      stock: 100,
      is_package: false,
      has_variants: false,
      variants: [],
    });
    setNewVariantName('');
    setNewVariantStock(100);
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) {
      toast.error('Varyant adı boş olamaz');
      return;
    }
    
    const newVariant = {
      name: newVariantName.trim(),
      stock: parseInt(newVariantStock),
    };
    
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    });
    
    setNewVariantName('');
    setNewVariantStock(100);
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6" data-testid="products-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Yönetimi</h1>
          <p className="text-gray-600">{products.length} ürün</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#78BE20] hover:bg-[#65A318] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          data-testid="add-product-button"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Ürün</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            data-testid={`product-item-${index}`}
          >
            <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                {product.is_package && (
                  <span className="bg-[#78BE20] text-white text-xs px-2 py-1 rounded-full">Paket</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-[#78BE20]">₺{product.price.toFixed(2)}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid={`edit-product-${index}`}
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`delete-product-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
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
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              data-testid="product-modal"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="product-name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4 py-3"
                    data-testid="product-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                      data-testid="product-price-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                      data-testid="product-stock-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    data-testid="product-image-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border-gray-200 focus:border-[#78BE20] focus:ring-[#78BE20]/20 px-4"
                    placeholder="örn: Protein, Vitamin"
                    data-testid="product-category-input"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_package}
                    onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="product-is-package-checkbox"
                  />
                  <label className="text-sm font-medium text-gray-700">Bu bir paket ürün</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.has_variants}
                    onChange={(e) => {
                      setFormData({ ...formData, has_variants: e.target.checked });
                      if (!e.target.checked) {
                        setFormData({ ...formData, has_variants: false, variants: [] });
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-[#78BE20] focus:ring-[#78BE20]"
                    data-testid="product-has-variants-checkbox"
                  />
                  <label className="text-sm font-medium text-gray-700">Bu ürünün varyantları var (Aroma seçimi)</label>
                </div>

                {formData.has_variants && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Varyantlar (Aromalar)</h3>
                    
                    <div className="space-y-2 mb-4">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">{variant.name}</span>
                            <span className="text-sm text-gray-500 ml-3">Stok: {variant.stock}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        placeholder="Varyant adı (ör: Çikolata)"
                        className="col-span-2 h-10 rounded-lg border-gray-200 px-3 text-sm"
                      />
                      <input
                        type="number"
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                        placeholder="Stok"
                        className="h-10 rounded-lg border-gray-200 px-3 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium"
                    >
                      + Varyant Ekle
                    </button>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-bold transition-colors"
                    data-testid="cancel-button"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#78BE20] hover:bg-[#65A318] text-white py-3 rounded-full font-bold transition-colors"
                    data-testid="save-product-button"
                  >
                    {editingProduct ? 'Güncelle' : 'Ekle'}
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

export default ProductsManagement;