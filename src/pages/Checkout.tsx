import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { items, getCartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    paymentMethod: 'cash',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Захиалга өгөхийн тулд нэвтэрнэ үү');
      return;
    }

    if (items.length === 0) {
      alert('Таны сагс хоосон байна');
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getCartTotal(),
          status: 'pending',
          payment_method: formData.paymentMethod,
          delivery_address: formData.address,
          delivery_city: formData.city,
          delivery_phone: formData.phone,
          notes: formData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.product_id,
          quantity: item.quantity,
        });

        if (stockError) {
          console.error('Stock update error:', stockError);
        }
      }

      await clearCart();

      alert('Захиалга амжилттай баталгаажлаа! Таны захиалгын дугаар: ' + order.id.slice(0, 8));
      onNavigate('orders');
    } catch (error) {
      console.error('Error:', error);
      alert('Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Захиалга өгөхийн тулд нэвтэрнэ үү
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Таны сагс хоосон байна
          </h2>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Захиалга баталгаажуулах</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Хүргэлтийн мэдээлэл</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Нэр *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Утасны дугаар *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хот *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хаяг *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Төлбөрийн хэлбэр *
                  </label>
                  <select
                    name="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Бэлэн мөнгө</option>
                    <option value="card">Карт</option>
                    <option value="transfer">Шилжүүлэг</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Нэмэлт тэмдэглэл
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Баталгаажуулж байна...' : 'Захиалга өгөх'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Захиалгын хураангуй</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString()}₮
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Нийт:</span>
                  <span className="text-blue-600">
                    {getCartTotal().toLocaleString()}₮
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• Хүргэлтийн үнэ: Үнэгүй (УБ хотод)</p>
                <p>• Хүргэлтийн хугацаа: 24-48 цаг</p>
                <p>• Буцаалт: 7 хоногийн дотор</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
