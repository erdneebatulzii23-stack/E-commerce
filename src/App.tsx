import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Account } from './pages/Account';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Admin } from './pages/Admin';

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'orders' | 'account' | 'login' | 'register' | 'admin';

interface PageData {
  productId?: string;
  categoryId?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<PageData>({});

  const navigate = (page: Page, data?: PageData) => {
    setCurrentPage(page);
    if (data) {
      setPageData(data);
    } else {
      setPageData({});
    }
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'products':
        return <Products onNavigate={navigate} initialCategoryId={pageData.categoryId} />;
      case 'product-detail':
        return pageData.productId ? (
          <ProductDetail productId={pageData.productId} onNavigate={navigate} />
        ) : (
          <Home onNavigate={navigate} />
        );
      case 'cart':
        return <Cart onNavigate={navigate} />;
      case 'checkout':
        return <Checkout onNavigate={navigate} />;
      case 'orders':
        return <Orders onNavigate={navigate} />;
      case 'account':
        return <Account onNavigate={navigate} />;
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'register':
        return <Register onNavigate={navigate} />;
      case 'admin':
        return <Admin onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {currentPage !== 'login' && currentPage !== 'register' && (
            <Header onNavigate={navigate} currentPage={currentPage} />
          )}
          {renderPage()}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
