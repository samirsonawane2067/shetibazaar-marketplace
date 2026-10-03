import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/products';
import { createProduct } from '../api/products';

const SellProduct = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    productName: '',
    productNameMarathi: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    unit: '',
    location: '',
    phoneNumber: '',
    condition: 'New',
    breed: '',
    age: '',
    gender: '',
    weight: '',
    health: '',
    milkProduction: '',
    brand: '',
    model: '',
    hpCompatibility: '',
    workingWidth: '',
    warranty: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const productData = {
        name: formData.productName,
        name_marathi: formData.productNameMarathi || formData.productName,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        unit: formData.unit,
        location: formData.location,
        seller_phone: formData.phoneNumber,
        tag: formData.condition,
        details: [
            formData.breed && `Breed: ${formData.breed}`,
            formData.age && `Age: ${formData.age}`,
            formData.gender && `Gender: ${formData.gender}`,
            formData.weight && `Weight: ${formData.weight}`,
            formData.health && `Health: ${formData.health}`,
            formData.milkProduction && `Milk: ${formData.milkProduction}`,
            formData.brand && `Brand: ${formData.brand}`,
            formData.model && `Model: ${formData.model}`,
            formData.hpCompatibility && `HP: ${formData.hpCompatibility}`,
            formData.workingWidth && `Width: ${formData.workingWidth}`,
            formData.warranty && `Warranty: ${formData.warranty}`
        ].filter(Boolean),
      };

      // If there's a photo file, include it
      if (photoFile) {
        productData.image = photoFile;
      }

      await createProduct(productData);
      
      alert(t('Product listed successfully!', 'उत्पादन यशस्वीरित्या लिस्ट केले!'));
      navigate('/my-products');
    } catch (err) {
      console.error('Failed to create product:', err);
      setError(err.response?.data?.message || t('Failed to list product. Please try again.', 'उत्पादन लिस्ट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setLoading(false);
    }
  };

  const isLivestock = formData.category === 'Livestock';
  const isMachinery = formData.category === 'Machinery' || formData.category === 'Tractor Parts';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('List Your Product', 'आपले उत्पादन विक्रीसाठी टाका')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('Fill in the details to list your product on ShetiBazaar', 'ShetiBazaar वर आपले उत्पादन लिस्ट करण्यासाठी तपशील भरा')}
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Product Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Product Name (English)', 'उत्पादनाचे नाव (इंग्रजी)')} *
              </label>
              <input
                type="text"
                name="productName"
                required
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('e.g. Hybrid Tomato Seeds', 'उदा. हायब्रिड टोमॅटो बियाणे')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Product Name (Marathi)', 'उत्पादनाचे नाव (मराठी)')}
              </label>
              <input
                type="text"
                name="productNameMarathi"
                value={formData.productNameMarathi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('उदा. हायब्रिड टोमॅटो बियाणे', 'e.g. हायब्रिड टोमॅटो बियाणे')}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Category', 'श्रेणी')} *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('Select category', 'श्रेणी निवडा')}</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {t(cat.name, cat.marathi)}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Price (₹)', 'किंमत (₹)')} *
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Quantity', 'प्रमाण')} *
              </label>
              <input
                type="number"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Unit', 'एकक')} *
              </label>
              <input
                type="text"
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('e.g. kg, piece, litre', 'उदा. किग्रा, तुकडा, लिटर')}
              />
            </div>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Location', 'ठिकाण')} *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('Village, District', 'गाव, जिल्हा')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Phone Number', 'फोन नंबर')} *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                pattern="[0-9+() -]{10,}"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Condition', 'स्थिती')} *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="New">{t('New', 'नवीन')}</option>
              <option value="Used">{t('Used', 'वापरलेले')}</option>
              <option value="Healthy">{t('Healthy', 'निरोगी')}</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Description', 'वर्णन')} *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('Describe your product in detail', 'आपले उत्पादन तपशीलवार वर्णन करा')}
            />
          </div>

          {/* Livestock Specific Fields */}
          {isLivestock && (
            <div className="bg-green-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-green-800">
                {t('Livestock Details', 'पशुधन तपशील')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Breed', 'जात')}
                  </label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Age', 'वय')}
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Gender', 'लिंग')}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t('Select', 'निवडा')}</option>
                    <option value="Male">{t('Male', 'नर')}</option>
                    <option value="Female">{t('Female', 'मादी')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Weight (kg)', 'वजन (किग्रा)')}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Health', 'आरोग्य')}
                  </label>
                  <input
                    type="text"
                    name="health"
                    value={formData.health}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Milk Production (litres/day)', 'दूध उत्पादन (लिटर/दिवसाला)')}
                  </label>
                  <input
                    type="text"
                    name="milkProduction"
                    value={formData.milkProduction}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Machinery Specific Fields */}
          {isMachinery && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-blue-800">
                {t('Machinery Details', 'यंत्रसामग्री तपशील')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Brand', 'ब्रँड')}
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Model', 'मॉडेल')}
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('HP Compatibility', 'एचपी सुसंगतता')}
                  </label>
                  <input
                    type="text"
                    name="hpCompatibility"
                    value={formData.hpCompatibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Working Width', 'कामाची रुंदी')}
                  </label>
                  <input
                    type="text"
                    name="workingWidth"
                    value={formData.workingWidth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Warranty', 'वॉरंटी')}
                  </label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Product Photo', 'उत्पादनाचा फोटो')} *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={uploading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-4 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              t('List Product', 'उत्पादन लिस्ट करा')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;
