import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../api/cart';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Always keep localStorage updated with current cart
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = async (product, quantity = 1) => {
    if (!product) return;
    const productId = product.id ?? product._id;
    if (productId === undefined || productId === null) return;

    // Immediately update local cart state
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        const itemId = item.id ?? item._id ?? item.product?.id ?? item.product?._id;
        return String(itemId) === String(productId);
      });

      if (existingIndex > -1) {
        return prevCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, id: productId, quantity }];
    });

    // Best-effort backend sync if logged in
    if (isAuthenticated) {
      try {
        await apiAddToCart(productId, quantity);
      } catch (error) {
        console.warn('Backend cart sync failed, preserved locally:', error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const itemId = item.id ?? item._id ?? item.product?.id ?? item.product?._id;
        return String(itemId) !== String(productId);
      })
    );

    if (isAuthenticated) {
      try {
        const itemToRemove = cart.find((item) => {
          const itemId = item.id ?? item._id ?? item.product?.id ?? item.product?._id;
          return String(itemId) === String(productId);
        });
        if (itemToRemove && itemToRemove._id) {
          await apiRemoveFromCart(itemToRemove._id);
        } else {
          await apiRemoveFromCart(productId);
        }
      } catch (error) {
        console.warn('Backend remove failed:', error);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId = item.id ?? item._id ?? item.product?.id ?? item.product?._id;
        return String(itemId) === String(productId)
          ? { ...item, quantity }
          : item;
      })
    );

    if (isAuthenticated) {
      try {
        const itemToUpdate = cart.find((item) => {
          const itemId = item.id ?? item._id ?? item.product?.id ?? item.product?._id;
          return String(itemId) === String(productId);
        });
        if (itemToUpdate && itemToUpdate._id) {
          await updateCartItem(itemToUpdate._id, quantity);
        }
      } catch (error) {
        console.warn('Backend update quantity failed:', error);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      localStorage.removeItem('cart');
    } catch (e) {
      console.warn(e);
    }
    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (error) {
        console.warn('Backend clear cart failed:', error);
      }
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = item.product || item;
    const price = Number(product.price) || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
