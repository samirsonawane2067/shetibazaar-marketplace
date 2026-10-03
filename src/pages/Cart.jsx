import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShield } from 'react-icons/fi';

const Cart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('Your Cart', 'तुमचे कार्ट')}
          </h1>
          <EmptyState
            icon="🛒"
            title={t('Your cart is empty', 'तुमचे कार्ट रिकामे आहे')}
            description={t(
              'Good things are waiting in the marketplace.',
              'बाजारपेठेत चांगली उत्पादने तुमची वाट पाहत आहेत.'
            )}
            actionText={t('Explore Products', 'उत्पादने पहा')}
            onAction={() => navigate('/marketplace')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('Your Cart', 'तुमचे कार्ट')}
          </h1>
          <Link
            to="/marketplace"
            className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>{t('Continue Shopping', 'खरेदी सुरू ठेवा')}</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.product || item;
              const itemId = item.id ?? item._id ?? product.id ?? product._id;
              return (
                <div
                  key={itemId}
                  className="bg-white rounded-xl shadow-sm p-4 flex gap-4 border border-gray-100 items-start"
                >
                  <Link to={`/product/${itemId}`} className="flex-shrink-0">
                    <img
                      src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${itemId}`}
                      className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-1 text-base block"
                    >
                      {t(product.name, product.marathi || product.nameMarathi)}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.seller || product.sellerName || 'Farmer Owner'} • {product.unit || 'kg'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id || item._id || product.id || product._id, (item.quantity || 1) - 1)
                          }
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id || item._id || product.id || product._id, (item.quantity || 1) + 1)
                          }
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id || item._id || product.id || product._id)}
                    className="text-red-500 hover:text-red-600 transition-colors self-start"
                    title={t('Remove', 'काढा')}
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              {t('Clear Cart', 'कार्ट साफ करा')}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('Order Summary', 'ऑर्डर सारांश')}
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Subtotal', 'एकूण')}</span>
                  <span className="font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Delivery', 'डिलिव्हरी')}</span>
                  <span className="font-semibold text-green-600">
                    {t('Free', 'मोफत')}
                  </span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold">{t('Total', 'एकूण')}</span>
                <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
              >
                {t('Proceed to Checkout', 'चेकआउट सुरू करा')}
              </Link>
              <p className="text-xs text-gray-500 text-center mt-4">
                {t(
                  'Online payment integration will be added later.',
                  'ऑनलाइन पेमेंट इंटिग्रेशन नंतर जोडले जाईल.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
