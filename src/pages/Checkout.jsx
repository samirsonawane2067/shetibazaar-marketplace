import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { t } = useLanguage();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    pincode: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo: Save order to localStorage
    const orderData = {
      id: Date.now(),
      shippingName: formData.fullName,
      shippingAddress: `${formData.address}, ${formData.village}, ${formData.taluka}, ${formData.district}`,
      shippingPhone: formData.mobile,
      shippingPincode: formData.pincode,
      paymentMethod: 'COD',
      items: cart,
      total: cartTotal,
      createdAt: new Date().toISOString(),
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    alert(t('Order placed successfully! (Demo)', 'ऑर्डर यशस्वीरित्या जमा झाला! (डेमो)'));
    clearCart();
    navigate('/');
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Your cart is empty', 'तुमचे कार्ट रिकामे आहे')}
          </h1>
          <Link
            to="/marketplace"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {t('Browse products', 'उत्पादने पहा')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Checkout', 'चेकआउट')}
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('Delivery Information', 'डिलिव्हरी माहिती')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Full Name', 'पूर्ण नाव')} *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Mobile Number', 'मोबाईल नंबर')} *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Address', 'पत्ता')} *
                </label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Village', 'गाव')} *
                  </label>
                  <input
                    type="text"
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Taluka', 'तालुका')} *
                  </label>
                  <input
                    type="text"
                    name="taluka"
                    required
                    value={formData.taluka}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('District', 'जिल्हा')} *
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Pincode', 'पिनकोड')} *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t('Payment Method', 'पेमेंट पद्धत')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      checked
                      readOnly
                      className="w-4 h-4 text-green-600"
                    />
                    <label htmlFor="cod" className="text-gray-900 font-medium">
                      {t('Cash on Delivery', 'डिलिव्हरीवर रोकड')}
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {t(
                      'Pay when your order is delivered.',
                      'आपला ऑर्डर डिलिव्हर होईल तेव्हा पैसे द्या.'
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {t(
                    'Online payment integration will be added later.',
                    'ऑनलाइन पेमेंट इंटिग्रेशन नंतर जोडले जाईल.'
                  )}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t('Place Order', 'ऑर्डर करा')
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t('Order Summary', 'ऑर्डर सारांश')}
              </h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id || item._id} className="flex gap-4">
                    <img
                      src={item.image || item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {t(item.name, item.marathi || item.nameMarathi)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.unit} × {item.quantity || 1}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
