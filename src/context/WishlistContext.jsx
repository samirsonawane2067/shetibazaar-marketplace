import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, toggleWishlist as apiToggleWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlist';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  // Don't sync wishlist on mount to avoid blocking
  // Wishlist will sync when user logs in

  const addToWishlist = async (product) => {
    if (isAuthenticated) {
      try {
        await apiToggleWishlist(product.id || product._id);
        const serverWishlist = await getWishlist();
        setWishlist(serverWishlist.map(item => item.product || item));
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      }
    } else {
      setWishlist((prev) => {
        if (prev.some((item) => (item.id || item._id) === (product.id || product._id))) {
          return prev;
        }
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        await apiRemoveFromWishlist(productId);
        const serverWishlist = await getWishlist();
        setWishlist(serverWishlist.map(item => item.product || item));
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
      }
    } else {
      setWishlist((prev) => prev.filter((item) => (item.id || item._id) !== productId));
    }
  };

  const toggleWishlist = async (product) => {
    const exists = wishlist.some((item) => (item.id || item._id) === (product.id || product._id));
    if (exists) {
      await removeFromWishlist(product.id || product._id);
      return false;
    } else {
      await addToWishlist(product);
      return true;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item.id || item._id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
