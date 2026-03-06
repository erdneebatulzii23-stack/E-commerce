import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface HomeProps {
  onNavigate: (page: string, data?: { productId?: string; categoryId?: string }) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8),
      supabase.from('categories').select('*').limit(6),
    ]);

    if (productsResult.data) setFeaturedProducts(productsResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);

    setLoading(false);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
    alert('Бүтээгдэхүүн сагсанд нэмэгдлээ!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Уншиж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ShopMN-д тавтай морил
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Чанартай бүтээгдэхүүнүүдийг таны гэрт хүргэнэ
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Худалдан авалт хийх
          </button>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ангилал</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate('products', { categoryId: category.id })}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-center">{category.name}</h3>
              </button>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Онцлох бүтээгдэхүүн</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {product.price.toLocaleString()}₮
                    </span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Хялбар худалдан авалт</h3>
              <p className="text-gray-600">Хэдэн товшилтоор бүтээгдэхүүн захиалах</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Чанартай бүтээгдэхүүн</h3>
              <p className="text-gray-600">100% баталгаатай бүтээгдэхүүн</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Хурдан хүргэлт</h3>
              <p className="text-gray-600">УБ хотод 24 цагт хүргэнэ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
