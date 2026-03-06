import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Star, ChevronLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  stock: number;
  category: {
    name: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export function ProductDetail({ productId, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('id', productId)
      .maybeSingle();

    if (data) {
      setProduct(data as any);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data as any);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity);
      alert('Бүтээгдэхүүн сагсанд нэмэгдлээ!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Үнэлгээ бичихийн тулд нэвтэрнэ үү');
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
    });

    if (error) {
      alert('Үнэлгээ нэмэхэд алдаа гарлаа');
    } else {
      setComment('');
      setRating(5);
      fetchReviews();
      alert('Үнэлгээ амжилттай нэмэгдлээ!');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Уншиж байна...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Бүтээгдэхүүн олдсонгүй</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Буцах
        </button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl p-6">
              {product.category && (
                <p className="text-sm text-blue-600 mb-2">{product.category.name}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({averageRating.toFixed(1)}) - {reviews.length} үнэлгээ
                </span>
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {product.price.toLocaleString()}₮
              </div>

              <p className="text-gray-600 mb-6">
                Үлдэгдэл: <span className="font-semibold">{product.stock} ширхэг</span>
              </p>

              <div className="flex items-center gap-4 mb-6">
                <label className="font-medium text-gray-700">Тоо ширхэг:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x border-gray-300 focus:outline-none"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Сагсанд нэмэх
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Үнэлгээ</h2>

          {user && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">Үнэлгээ үлдээх</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Үнэлгээ
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сэтгэгдэл
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Үнэлгээ илгээх
              </button>
            </form>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-600">Одоогоор үнэлгээ байхгүй байна.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.user.full_name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('mn-MN')}
                    </p>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
