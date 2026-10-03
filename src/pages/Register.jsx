import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { t } = useLanguage();
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefilledIdentifier = searchParams.get('identifier') || searchParams.get('email') || searchParams.get('mobile') || '';
  const isEmailPrefill = prefilledIdentifier.includes('@');

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: !isEmailPrefill ? prefilledIdentifier : '',
    email: isEmailPrefill ? prefilledIdentifier : '',
    password: '',
    confirmPassword: '',
    farmName: '',
    village: '',
    taluka: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // If already logged in, keep user in app
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/marketplace', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(t('Passwords do not match', 'संकेतशब्द जुळत नाहीत'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newUser = {
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        password: formData.password,
        farmName: formData.farmName,
        farm_name: formData.farmName,
        village: formData.village,
        taluka: formData.taluka,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        location: `${formData.village || ''}, ${formData.taluka || ''}, ${formData.district || ''}, ${formData.state || 'Maharashtra'}`.replace(/^[\s,]+|[\s,]+$/g, ''),
      };

      await register(newUser);
      navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-4xl">🌱</span>
              <div>
                <span className="text-2xl font-bold text-green-700">
                  Sheti<span className="text-green-500">Bazaar</span>
                </span>
                <p className="text-xs text-gray-600">शेती बाजार</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Create Farmer Account', 'शेतकरी खाते तयार करा')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('Join Maharashtra\'s largest farmer marketplace', 'महाराष्ट्राच्या सर्वात मोठ्या शेतकरी बाजारपेठेत सामील व्हा')}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email', 'ईमेल')} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Farm Name', 'शेताचे नाव')} *
                </label>
                <input
                  type="text"
                  name="farmName"
                  required
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Password', 'संकेतशब्द')} *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Confirm Password', 'संकेतशब्द पुष्टी करा')} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <hr className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('State', 'राज्य')} *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                t('Create Account', 'खाते तयारा करा')
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {t('Already have an account?', 'आधीच खाते आहे का?')}{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              {t('Login', 'लॉगिन')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
