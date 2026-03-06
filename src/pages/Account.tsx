import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

interface AccountProps {
  onNavigate: (page: string) => void;
}

export function Account({ onNavigate }: AccountProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
      })
      .eq('id', user.id);

    if (error) {
      alert('Мэдээлэл шинэчлэхэд алдаа гарлаа');
    } else {
      await refreshProfile();
      alert('Мэдээлэл амжилттай шинэчлэгдлээ!');
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Профайл үзэхийн тулд нэвтэрнэ үү
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Миний профайл</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.full_name || 'Хэрэглэгч'}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
              {profile?.is_admin && (
                <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Админ
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Нэр
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Утасны дугаар
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хот
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хаяг
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Шинэчилж байна...' : 'Мэдээлэл шинэчлэх'}
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('orders')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Миний захиалга</h3>
            <p className="text-sm text-gray-600">Захиалгын түүх үзэх</p>
          </button>

          <button
            onClick={() => onNavigate('cart')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Миний сагс</h3>
            <p className="text-sm text-gray-600">Сагсны бүтээгдэхүүн үзэх</p>
          </button>
        </div>
      </div>
    </div>
  );
}
