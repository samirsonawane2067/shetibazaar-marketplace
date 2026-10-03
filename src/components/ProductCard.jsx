import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiShoppingCart, FiPhone, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getSellerPhone, formatPhoneForCall, generateWhatsAppMessage, generateWhatsAppMessageEnglish } from '../utils/whatsapp';

const ProductCard = ({ product, onClick }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const productId = product.id ?? product._id;
  const wished = isInWishlist(productId);
  const sellerPhone = getSellerPhone(product);

  const whatsappUrl = language === 'mr'
    ? generateWhatsAppMessage(product.name, product.marathi || product.nameMarathi, sellerPhone)
    : generateWhatsAppMessageEnglish(product.name, sellerPhone);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer block text-left"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick(e);
      }}
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image || product.imageUrl || product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.tag && (
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              {product.tag}
            </span>
          )}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm ${
              wished ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500'
            }`}
            title={t('Wishlist', 'आवडते')}
          >
            <FiHeart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                {t(product.category, product.category)}
              </span>
              <div className="flex items-center text-yellow-500 text-xs font-semibold">
                <span>★</span>
                <span className="ml-1 text-gray-700">{product.rating || '4.5'}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
              {t(product.name, product.marathi || product.nameMarathi)}
            </h3>

            <p className="text-xs text-gray-500 mb-3 truncate">
              {product.seller || product.sellerName || 'Farmer Owner'} • {product.location || 'Maharashtra'}
            </p>
          </div>

          <div>
            {/* Price & Add to Cart button */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                <span className="text-xs text-gray-500 ml-1">/ {product.unit || 'kg'}</span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                }`}
                title={t('Add to cart', 'कार्टमध्ये जोडा')}
              >
                {added ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>{t('Added', 'जोडले')}</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-4 h-4" />
                    <span>{t('Add to Cart', 'कार्टमध्ये जोडा')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Call and WhatsApp options below the product */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${formatPhoneForCall(sellerPhone)}`}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors border border-blue-100"
                title={t('Call Seller', 'विक्रेत्याला कॉल करा')}
              >
                <FiPhone className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Call', 'कॉल')}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-100"
                title={t('WhatsApp', 'व्हॉट्सअॅप')}
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                <span>{t('WhatsApp', 'व्हॉट्सअॅप')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
