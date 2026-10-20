import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getProduct } from '../api/products';
import { products as staticProducts } from '../data/products';
import { FiHeart, FiShoppingCart, FiPhone, FiArrowLeft, FiCheck, FiShield, FiMapPin, FiAward, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getSellerPhone, formatPhoneForCall, generateWhatsAppMessage, generateWhatsAppMessageEnglish } from '../utils/whatsapp';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import PriceHistoryChart from '../components/PriceHistoryChart';
import Recommendations from '../components/Recommendations';
import { getFullImageUrl } from '../utils/imageUrl';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        if (data && (data.id || data._id || data.name)) {
          setProduct(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API fetch product failed, falling back to static/local products:', err);
      }

      // Check static catalog
      let found = staticProducts.find(
        (p) => String(p.id) === String(id) || String(p._id) === String(id)
      );

      // Check local storage products
      if (!found) {
        try {
          const userProducts = JSON.parse(localStorage.getItem('my_products') || '[]');
          found = userProducts.find(
            (p) => String(p.id) === String(id) || String(p._id) === String(id)
          );
        } catch (e) {
          // ignore
        }
      }

      if (found) {
        setProduct(found);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-4">
          <span className="text-4xl mb-4 block">🌾</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('Product not found', 'उत्पादन सापडले नाही')}
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            {t('The product you are looking for might have been moved or removed.', 'तुम्ही शोधत असलेले उत्पादन हलवले किंवा काढले गेले असू शकते.')}
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            {t('Back to marketplace', 'बाजारपेठेत परत जा')}
          </Link>
        </div>
      </div>
    );
  }

  const productId = product.id ?? product._id;
  const wished = isInWishlist(productId);
  const sellerPhone = getSellerPhone(product);
  const sellerName = product.seller || product.sellerName || product.seller_name || 'Farmer Owner';
  const sellerAvatar = getFullImageUrl(product.seller_avatar_url || product.sellerAvatarUrl);
  const productImage = product.image || product.imageUrl || product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200';
  const details = Array.isArray(product.details) ? product.details : [];
  const isInCart = cart.some(
    (item) => String(item.id ?? item._id ?? item.product?.id ?? item.product?._id) === String(productId)
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const whatsappUrl = language === 'mr'
    ? generateWhatsAppMessage(product.name, product.marathi || product.nameMarathi, sellerPhone)
    : generateWhatsAppMessageEnglish(product.name, sellerPhone);

  const renderDynamicDetails = () => {
    if (product.category === 'Seeds') {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">{t('Seed Details', 'बियाणे तपशील')}</h4>
          <ul className="space-y-1 text-gray-600">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (product.category === 'Machinery' || product.category === 'Tractor Parts') {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">{t('Equipment Details', 'उपकरण तपशील')}</h4>
          <ul className="space-y-1 text-gray-600">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                {detail}
              </li>
            ))}
          </ul>
          {product.tag === 'Used' && (
            <p className="text-yellow-600 text-sm mt-2">
              {t('Please inspect machinery before purchase.', 'खरेदीपूर्वी यंत्राची तपासणी करा.')}
            </p>
          )}
        </div>
      );
    }

    if (product.category === 'Livestock') {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">{t('Livestock Details', 'पशुधन तपशील')}</h4>
          <ul className="space-y-1 text-gray-600">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                {detail}
              </li>
            ))}
          </ul>
          <p className="text-yellow-600 text-sm mt-2">
            {t('Please verify animal health before purchase.', 'खरेदीपूर्वार प्राण्याचे आरोग्य सत्यापित करा.')}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900">{t('Product Details', 'उत्पादन तपशील')}</h4>
        <ul className="space-y-1 text-gray-600">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/marketplace"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          {t('Back to marketplace', 'बाजारपेठेत परत जा')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.tag && (
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {product.tag}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full text-sm">
                {t(product.category, product.category)}
              </span>
              <div className="flex items-center text-yellow-500">
                <span className="text-xl">★</span>
                <span className="ml-1 text-gray-600 font-medium">{product.rating}</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t(product.name, product.marathi || product.nameMarathi)}
              </h1>
              <p className="text-gray-600">
                {(product.seller || product.sellerName)} • {product.location}, Maharashtra
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              <span className="text-xl text-gray-500 ml-2">/ {product.unit}</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('Description', 'वर्णन')}
              </h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Dynamic Details */}
            {renderDynamicDetails()}

            {/* Retailer / Owner Details Card */}
            <div className="bg-gradient-to-br from-green-50/70 to-emerald-50/50 border border-green-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-green-600 text-white rounded-lg">
                    <FiShield className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                      {t('Retailer & Owner Details', 'किरकोळ विक्रेता / मालक माहिती')}
                    </h3>
                    <p className="text-xs text-green-700 font-medium">
                      {t('Verified Farmer Seller', 'सत्यापित शेतकरी विक्रेता')}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                  <FiAward className="w-3.5 h-3.5" />
                  {t('Verified', 'सत्यापित')}
                </span>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                  {sellerAvatar ? (
                    <img
                      src={sellerAvatar}
                      alt={`${sellerName} profile`}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        event.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span style={{ display: sellerAvatar ? 'none' : 'block' }}>
                    {sellerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 truncate">
                    {sellerName}
                  </h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{product.location ? `${product.location}, Maharashtra` : 'Maharashtra, India'}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span className="flex items-center text-yellow-500 font-semibold">
                      ★ <span className="ml-1 text-gray-800">{product.rating || '4.8'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-gray-500 gap-1">
                      <FiClock className="w-3 h-3 text-green-600" />
                      {t('Quick responder', 'त्वरित संपर्क')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Owner Phone display */}
              <div className="mt-4 pt-3 border-t border-green-100/80 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">{t('Owner Contact Phone:', 'मालक संपर्क फोन:')}</span>
                <span className="font-semibold text-gray-800 font-mono text-sm">{sellerPhone}</span>
              </div>
            </div>

            {/* Actions: Add to Cart, Call, and WhatsApp */}
            <div className="space-y-3 pt-2">
              {/* Quantity selector & Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-gray-600 hover:bg-gray-100 font-semibold text-base transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-3 text-gray-900 font-bold text-base min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-3 text-gray-600 hover:bg-gray-100 font-semibold text-base transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                    added
                      ? 'bg-emerald-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {added ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      <span>{t('Added to Cart!', 'कार्टमध्ये जोडले गेले!')}</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-5 h-5" />
                      <span>{t('Add to Cart', 'कार्टमध्ये जोडा')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`p-3.5 rounded-xl border transition-colors shadow-sm ${
                    wished
                      ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={t('Wishlist', 'आवडते')}
                >
                  <FiHeart className={`w-5 h-5 ${wished ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* In Cart notification banner */}
              {isInCart && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                    {t('This item is in your shopping cart', 'हे उत्पादन आपल्या खरेदी कार्टमध्ये आहे')}
                  </span>
                  <Link to="/cart" className="font-bold underline hover:text-emerald-900">
                    {t('View Cart', 'कार्ट पहा')} →
                  </Link>
                </div>
              )}

              {/* Call and WhatsApp options below the product */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${formatPhoneForCall(sellerPhone)}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-[0.99]"
                >
                  <FiPhone className="w-5 h-5" />
                  <span>{t('Call Owner', 'मालकाला कॉल करा')}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all active:scale-[0.99]"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>{t('WhatsApp Owner', 'व्हॉट्सअॅप करा')}</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="w-full py-2.5 text-xs text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                {t('View Full Owner / Retailer Information', 'संपूर्ण मालक / विक्रेता माहिती पहा')}
              </button>
            </div>

            {/* Demo Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                {t('Demo Contact', 'डेमो संपर्क')} - {t('This is a frontend demo. Phone numbers are for demonstration purposes only.', 'हा फ्रंटएंड डेमो आहे. फोन नंबर फक्त प्रदर्शनासाठी आहेत.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Price History */}
          <PriceHistoryChart productId={id} />

          {/* Similar Products */}
          <Recommendations type="similar" productId={id} limit={4} />
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('Reviews', 'समीक्षा')}
            </h2>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showReviewForm ? t('Cancel', 'रद्द करा') : t('Write a Review', 'समीक्षा लिहा')}
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                productId={id}
                sellerId={product?.seller_id}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  setReviewSubmitted(!reviewSubmitted);
                }}
              />
            </div>
          )}

          <ReviewList key={reviewSubmitted ? 'refresh' : 'initial'} productId={id} />
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t('Seller Contact Details', 'विक्रेता संपर्क तपशील')}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('Retailer / Owner Name', 'किरकोळ विक्रेता / मालकाचे नाव')}
                </label>
                <p className="text-gray-900 font-bold text-lg">{product.seller || product.sellerName || 'Farmer Owner'}</p>
                <span className="inline-block mt-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  {t('Verified Agricultural Retailer', 'सत्यापित कृषी विक्रेता')}
                </span>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('Phone Number', 'फोन नंबर')}
                </label>
                <p className="text-gray-900 font-mono font-bold text-base">{sellerPhone}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('Location', 'ठिकाण')}
                </label>
                <p className="text-gray-900 font-medium">{product.location ? `${product.location}, Maharashtra` : 'Maharashtra, India'}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {t('Seller Rating', 'विक्रेता रेटिंग')}
                </label>
                <p className="text-gray-900 font-medium">★ {product.rating || '4.8'} / 5.0</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href={`tel:${formatPhoneForCall(sellerPhone)}`}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FiPhone className="w-4 h-4" />
                <span>{t('Call Now', 'आता कॉल करा')}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>{t('WhatsApp', 'व्हॉट्सअॅप')}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
