import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Search, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  stock: number;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsProps {
  onNavigate: (page: string, data?: { productId?: string }) => void;
  initialCategoryId?: string;
}

export function Products({ onNavigate, initialCategoryId }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data } = await query;

    if (data) {
      let sorted = [...data];
      if (sortBy === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price);
      } else {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      }
      setProducts(sorted);
    }

    setLoading(false);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
    alert('Бүтээгдэхүүн сагсанд нэмэгдлээ!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Бүтээгдэхүүн</h1>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Бүтээгдэхүүн хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ангилал
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Бүгд</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Эрэмбэлэх
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Нэрээр</option>
                <option value="price-asc">Үнэ (Багаас их)</option>
                <option value="price-desc">Үнэ (Ихээс бага)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Уншиж байна...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Бүтээгдэхүүн олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
              >
                <button
                  onClick={() => onNavigate('product-detail', { productId: product.id })}
                  className="w-full"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="p-4">
                  <button
                    onClick={() => onNavigate('product-detail', { productId: product.id })}
                    className="text-left w-full"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </button>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">(4.5)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Үлдэгдэл: {product.stock} ширхэг
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {product.price.toLocaleString()}₮
                    </span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
