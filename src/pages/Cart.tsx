import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onNavigate: (page: string) => void;
}

export function Cart({ onNavigate }: CartProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Уншиж байна...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Таны сагс хоосон байна</h2>
          <p className="text-gray-600 mb-6">Бүтээгдэхүүн нэмж эхлээрэй</p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Бүтээгдэхүүн үзэх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Миний сагс</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 shadow-sm flex gap-4"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600 mb-4">
                    {item.product.price.toLocaleString()}₮
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Нийт дүн</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Бүтээгдэхүүн:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Нийт тоо:</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Нийт:</span>
                  <span className="text-blue-600">
                    {getCartTotal().toLocaleString()}₮
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Худалдан авах
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
