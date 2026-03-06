import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, CreditCard as Edit, Trash2, Package, ShoppingBag, Users } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface AdminProps {
  onNavigate: (page: string) => void;
}

export function Admin({ onNavigate }: AdminProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category_id: '',
    is_featured: false,
    is_active: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (profile?.is_admin) {
      fetchData();
    }
  }, [profile, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'products') {
      await fetchProducts();
      await fetchCategories();
    } else if (activeTab === 'categories') {
      await fetchCategories();
    } else if (activeTab === 'orders') {
      await fetchOrders();
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (data) setOrders(data as any);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      image_url: productForm.image_url || null,
      category_id: productForm.category_id || null,
      is_featured: productForm.is_featured,
      is_active: productForm.is_active,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      if (!error) {
        alert('Бүтээгдэхүүн шинэчлэгдлээ!');
      }
    } else {
      const { error } = await supabase.from('products').insert(productData);
      if (!error) {
        alert('Бүтээгдэхүүн нэмэгдлээ!');
      }
    }

    setShowProductModal(false);
    setEditingProduct(null);
    resetProductForm();
    fetchProducts();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryForm)
        .eq('id', editingCategory.id);
      if (!error) {
        alert('Ангилал шинэчлэгдлээ!');
      }
    } else {
      const { error } = await supabase.from('categories').insert(categoryForm);
      if (!error) {
        alert('Ангилал нэмэгдлээ!');
      }
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    resetCategoryForm();
    fetchCategories();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Бүтээгдэхүүн устгах уу?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        alert('Бүтээгдэхүүн устгагдлаа!');
        fetchProducts();
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Ангилал устгах уу?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        alert('Ангилал устгагдлаа!');
        fetchCategories();
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      alert('Захиалгын төлөв шинэчлэгдлээ!');
      fetchOrders();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category_id: '',
      is_featured: false,
      is_active: true,
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
    });
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        image_url: product.image_url || '',
        category_id: product.category_id || '',
        is_featured: product.is_featured,
        is_active: product.is_active,
      });
    } else {
      resetProductForm();
    }
    setShowProductModal(true);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Админы эрх шаардлагатай
          </h2>
          <button
            onClick={() => onNavigate('home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Нүүр хуудас руу буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ самбар</h1>

        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="inline w-5 h-5 mr-2" />
            Бүтээгдэхүүн
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="inline w-5 h-5 mr-2" />
            Ангилал
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            Захиалга
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Уншиж байна...</div>
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Бүтээгдэхүүн ({products.length})</h2>
                  <button
                    onClick={() => openProductModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Бүтээгдэхүүн нэмэх
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Нэр
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Үнэ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Үлдэгдэл
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Онцлох
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Идэвхтэй
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Үйлдэл
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.price.toLocaleString()}₮
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.is_featured
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {product.is_featured ? 'Тийм' : 'Үгүй'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {product.is_active ? 'Тийм' : 'Үгүй'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openProductModal(product)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Ангилал ({categories.length})</h2>
                  <button
                    onClick={() => openCategoryModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Ангилал нэмэх
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {category.description || 'Тайлбар байхгүй'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                        >
                          Засах
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Захиалга ({orders.length})</h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Захиалгын дугаар
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Хэрэглэгч
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Дүн
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Огноо
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Төлөв
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.profiles.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.profiles.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.total_amount.toLocaleString()}₮
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('mn-MN')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value)
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Хүлээгдэж байна</option>
                                <option value="confirmed">Баталгаажсан</option>
                                <option value="shipped">Илгээсэн</option>
                                <option value="delivered">Хүргэгдсэн</option>
                                <option value="cancelled">Цуцлагдсан</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Бүтээгдэхүүн засах' : 'Бүтээгдэхүүн нэмэх'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Үнэ *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Үлдэгдэл *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зургийн URL
                </label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ангилал
                </label>
                <select
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Сонгох</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_featured: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Онцлох
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Идэвхтэй
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingProduct ? 'Шинэчлэх' : 'Нэмэх'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingCategory ? 'Ангилал засах' : 'Ангилал нэмэх'}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCategory ? 'Шинэчлэх' : 'Нэмэх'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
