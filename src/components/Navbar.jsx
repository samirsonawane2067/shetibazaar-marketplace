import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import NotificationBell from './NotificationBell';
import { getFullImageUrl } from '../utils/imageUrl';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('Home', 'मुख्यपृष्ठ') },
    { path: '/marketplace', label: t('Marketplace', 'बाजारपेठ') },
    { path: '/categories', label: t('Categories', 'श्रेणी') },
    { path: '/sell-product', label: t('Sell Product', 'उत्पादन विक्रीसाठी टाका') },
    { path: '/launch-product', label: t('Launch Product', 'उत्पादन लॉन्च करा') },
    { path: '/launches', label: t('Community Launches', 'सामुदायिक लॉन्च') },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-green-700">
                Sheti<span className="text-green-500">Bazaar</span>
              </span>
              <span className="text-xs text-gray-600">शेती बाजार</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-600 border border-gray-300 rounded-lg hover:border-green-500 transition-colors"
            >
              {language === 'en' ? 'मराठी' : 'English'}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <FiHeart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User/Login */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {user?.avatarUrl || user?.avatar_url || localStorage.getItem(`user_avatar_backup_${user?.id}`) || localStorage.getItem('user_avatar_backup') ? (
                  <img
                    src={getFullImageUrl(
                      user?.avatarUrl ||
                      user?.avatar_url ||
                      (user?.id && localStorage.getItem(`user_avatar_backup_${user.id}`)) ||
                      localStorage.getItem('user_avatar_backup')
                    )}
                    alt={user?.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-white/80"
                    onError={(e) => {
                      const backup = (user?.id && localStorage.getItem(`user_avatar_backup_${user.id}`)) || localStorage.getItem('user_avatar_backup');
                      if (backup && e.target.src !== backup) {
                        e.target.src = backup;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <FiUser className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                {t('Login', 'लॉगिन')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-green-600'
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t flex items-center justify-between">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"
              >
                {language === 'en' ? 'मराठी' : 'English'}
              </button>
              <div className="flex items-center space-x-4">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative p-2 text-gray-700"
                >
                  <FiHeart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative p-2 text-gray-700"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            {isAuthenticated ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {t('My Profile', 'माझे प्रोफाइल')}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {t('Login', 'लॉगिन')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
