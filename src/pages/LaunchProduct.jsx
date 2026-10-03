import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createLaunch, getLaunchProducts } from '../api/launches';

const LaunchProduct = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    launchTitle: '',
    launchTitleMarathi: '',
    description: '',
    specialPrice: '',
    launchDate: '',
    launchImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      alert(t('You must login to launch products', 'उत्पादन लॉन्च करण्यासाठी तुम्ही लॉगिन करणे आवश्यक आहे'));
      navigate('/login');
    }
  }, [isAuthenticated, navigate, t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getLaunchProducts()
      .then(setUserProducts)
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load your products'))
      .finally(() => setLoadingProducts(false));
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo: Save launch to localStorage
    const existingLaunches = JSON.parse(localStorage.getItem('productLaunches') || '[]');
    const newLaunch = {
      id: Date.now(),
      ...formData,
      image: previewImage || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80',
      createdAt: new Date().toISOString(),
    };
    existingLaunches.push(newLaunch);
    localStorage.setItem('productLaunches', JSON.stringify(existingLaunches));
    
    alert(t('Product launch created successfully!', 'उत्पादन लॉन्च यशस्वीरित्या तयार झाला!'));
    navigate('/dashboard');
  };

  const handleRemoteSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createLaunch({ ...formData, image: imageFile });
      alert(t('Product launch created successfully!', 'Launch created successfully!'));
      navigate('/launches');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create product launch');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProducts) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading your products...</div>;
  }

  if (userProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('No products to launch', 'लॉन्च करण्यासाठी कोणतेही उत्पादन नाही')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('First list some products, then you can launch them.', 'प्रथम काही उत्पादने लिस्ट करा, नंतर आपण ती लॉन्च करू शकता.')}
          </p>
          <button
            onClick={() => navigate('/sell-product')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('List a Product', 'उत्पादन लिस्ट करा')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('Launch Product', 'उत्पादन लॉन्च करा')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('Create a special launch for your product to attract more buyers', 'अधिक खरेदीदार आकर्षित करण्यासाठी आपल्या उत्पादनासाठी विशेष लॉन्च तयार करा')}
        </p>

        <form onSubmit={handleRemoteSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Select Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Select Product', 'उत्पादन निवडा')} *
            </label>
            <select
              name="productId"
              required
              value={formData.productId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('Choose a product', 'उत्पादन निवडा')}</option>
              {userProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName || product.name} - ₹{product.price}
                </option>
              ))}
            </select>
          </div>

          {/* Launch Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Launch Title (English)', 'लॉन्च शीर्षक (इंग्रजी)')} *
              </label>
              <input
                type="text"
                name="launchTitle"
                required
                value={formData.launchTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('e.g. Special Offer - Limited Stock', 'उदा. विशेष ऑफर - मर्यादित स्टॉक')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Launch Title (Marathi)', 'लॉन्च शीर्षक (मराठी)')}
              </label>
              <input
                type="text"
                name="launchTitleMarathi"
                value={formData.launchTitleMarathi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('उदा. विशेष ऑफर - मर्यादित स्टॉक', 'e.g. विशेष ऑफर - मर्यादित स्टॉका')}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Launch Description', 'लॉन्च वर्णन')} *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('Describe the special offer or launch details', 'विशेष ऑफर किंवा लॉन्च तपशील वर्णन करा')}
            />
          </div>

          {/* Special Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Special Price (₹)', 'विशेष किंमत (₹)')}
            </label>
            <input
              type="number"
              name="specialPrice"
              value={formData.specialPrice}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('Leave empty if no special price', 'विशेष किंमत नसल्यास रिक्त सोडा')}
            />
          </div>

          {/* Launch Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Launch Date', 'लॉन्च तारी')} *
            </label>
            <input
              type="date"
              name="launchDate"
              required
              value={formData.launchDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Launch Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Launch Image', 'लॉन्च प्रतिमा')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60"
          >
            {saving ? 'Publishing...' : t('Create Launch', 'लॉन्च तयार करा')}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LaunchProduct;
