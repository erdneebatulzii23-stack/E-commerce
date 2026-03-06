import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_phone: string;
  notes: string | null;
  created_at: string;
  order_items: {
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string | null;
    };
  }[];
}

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export function Orders({ onNavigate }: OrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as any);
    }
    setLoading(false);
  };

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Хүлээгдэж байна',
      confirmed: 'Баталгаажсан',
      shipped: 'Илгээсэн',
      delivered: 'Хүргэгдсэн',
      cancelled: 'Цуцлагдсан',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Захиалга үзэхийн тулд нэвтэрнэ үү
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Уншиж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Миний захиалга</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Та захиалга өгөөгүй байна
            </h2>
            <p className="text-gray-600 mb-6">Бүтээгдэхүүн үзэж эхлээрэй</p>
            <button
              onClick={() => onNavigate('products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Бүтээгдэхүүн үзэх
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Захиалга #{order.id.slice(0, 8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('mn-MN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {order.total_amount.toLocaleString()}₮
                        </p>
                      </div>
                      <button className="p-2">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Хүргэлтийн мэдээлэл
                          </h4>
                          <p className="text-sm text-gray-600">
                            Хаяг: {order.delivery_address}, {order.delivery_city}
                          </p>
                          <p className="text-sm text-gray-600">
                            Утас: {order.delivery_phone}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Төлбөрийн мэдээлэл
                          </h4>
                          <p className="text-sm text-gray-600">
                            Төлбөрийн хэлбэр:{' '}
                            {order.payment_method === 'cash'
                              ? 'Бэлэн мөнгө'
                              : order.payment_method === 'card'
                              ? 'Карт'
                              : 'Шилжүүлэг'}
                          </p>
                          {order.notes && (
                            <p className="text-sm text-gray-600">
                              Тэмдэглэл: {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-3">
                        Захиалсан бүтээгдэхүүн
                      </h4>
                      <div className="space-y-3">
                        {order.order_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 bg-white p-3 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.product.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Тоо ширхэг: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {(item.price * item.quantity).toLocaleString()}₮
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
