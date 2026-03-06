import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              ShopMN
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`${
                currentPage === 'home' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition`}
            >
              Нүүр
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`${
                currentPage === 'products' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition`}
            >
              Бүтээгдэхүүн
            </button>
            {profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`${
                  currentPage === 'admin' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition`}
              >
                Админ
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('cart')}
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('account')}
                  className="p-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <User className="w-6 h-6" />
                </button>
                <button
                  onClick={() => onNavigate('orders')}
                  className="p-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <Package className="w-6 h-6" />
                </button>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Нэвтрэх
              </button>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Нүүр
              </button>
              <button
                onClick={() => {
                  onNavigate('products');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Бүтээгдэхүүн
              </button>
              {profile?.is_admin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Админ
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
