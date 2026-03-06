import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data as unknown as CartItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      alert('Нэвтэрсний дараа сагсанд нэмнэ үү');
      return;
    }

    const existingItem = items.find(item => item.product_id === productId);

    if (existingItem) {
      await updateQuantity(productId, existingItem.quantity + quantity);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

      if (!error) {
        await fetchCart();
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      await fetchCart();
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      await fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setItems([]);
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
