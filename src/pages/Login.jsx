import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { checkUser } from '../api/auth';

const Login = () => {
  const { t } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/marketplace';
  const redirectMessage = location.state?.message;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // If user is already logged in, keep them on their destination page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
    // Reset new user flag when input changes
    if (error || isNewUser || checkResult) {
      setError(null);
      setIsNewUser(false);
      setCheckResult(null);
    }
  };

  const handleCheckUser = async () => {
    if (!formData.email.trim()) {
      setError(t('Please enter your email or mobile number first', 'कृपया प्रथम तुमचा ईमेल किंवा मोबाईल नंबर टाका'));
      return;
    }
    setCheckingUser(true);
    setError(null);
    setCheckResult(null);
    try {
      const res = await checkUser(formData.email.trim());
      setCheckResult({
        exists: true,
        message: t(
          `Registered user found: ${res.user?.name || res.user?.email}. Please enter your password to login.`,
          `नोंदणीकृत वापरकर्ता सापडला: ${res.user?.name || res.user?.email}. कृपया लॉगिन करण्यासाठी संकेतशब्द टाका.`
        ),
      });
      setIsNewUser(false);
    } catch (err) {
      const isNotReg = err.response?.status === 404 || err.response?.data?.isNewUser;
      if (isNotReg) {
        setIsNewUser(true);
        setError(
          t(
            'User is not registered in our database. You are a new user, please register first.',
            'वापरकर्ता आमच्या डेटाबेसमध्ये नोंदणीकृत नाही. आपण नवीन वापरकर्ता आहात, कृपया प्रथम नोंदणी करा.'
          )
        );
      } else {
        setError(err.response?.data?.message || err.message || 'Error checking user database');
      }
    } finally {
      setCheckingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsNewUser(false);
    setCheckResult(null);

    try {
      await login(formData.email.trim(), formData.password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const isNotFound = err.isNewUser || err.statusCode === 404 || (err.message && err.message.toLowerCase().includes('not register'));
      if (isNotFound) {
        setIsNewUser(true);
        setError(
          t(
            'User not found in database. You are a new user, please register to continue.',
            'डेटाबेसमध्ये वापरकर्ता सापडला नाही. आपण नवीन वापरकर्ता आहात, पुढे जाण्यासाठी कृपया नोंदणी करा.'
          )
        );
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsNewUser(false);
      await login('ramesh@demo.com', 'demo123');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-4xl">🌱</span>
              <div>
                <span className="text-2xl font-bold text-green-700">
                  Sheti<span className="text-green-500">Bazaar</span>
                </span>
                <p className="text-xs text-gray-600">शेती बाजार</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Farmer Login', 'शेतकरी लॉगिन')}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              {t('Login to see, buy, and sell agricultural products', 'शेती उत्पादने पाहण्यासाठी, खरेदी आणि विक्रीसाठी लॉगिन करा')}
            </p>
          </div>

          {/* Condition Notice if redirected from trying to see/sell/buy without login */}
          {redirectMessage && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm flex items-start space-x-2">
              <span className="text-lg leading-tight">🔒</span>
              <div>
                <p className="font-semibold text-amber-800">{t('Authentication Required', 'लॉगिन आवश्यक आहे')}</p>
                <p className="text-xs text-amber-700 mt-0.5">{redirectMessage}</p>
              </div>
            </div>
          )}

          {/* New User Alert: told to register if not in database */}
          {isNewUser && (
            <div className="mb-5 p-4 bg-orange-50 border-2 border-orange-300 rounded-xl text-orange-950 shadow-sm animate-fade-in">
              <div className="flex items-center space-x-2 mb-2 font-bold text-orange-900">
                <span className="text-2xl">⚠️</span>
                <span>{t('New User - Registration Required!', 'नवीन वापरकर्ता - नोंदणी आवश्यक!')}</span>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                {t(
                  'We searched our database and this account is not registered. Please register first to access products, sell, or buy.',
                  'आम्ही डेटाबेसमध्ये शोधले आणि हे खाते नोंदणीकृत नाही. कृपया उत्पादने पाहण्यासाठी, खरेदी किंवा विक्रीसाठी प्रथम नोंदणी करा.'
                )}
              </p>
              <Link
                to={`/register?identifier=${encodeURIComponent(formData.email.trim())}`}
                className="block text-center w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-colors text-sm"
              >
                {t('Click Here to Register Now', 'येथे क्लिक करून आता नोंदणी करा')} →
              </Link>
            </div>
          )}

          {/* User Check Success Alert */}
          {checkResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-xl text-green-900 text-sm">
              <p className="font-medium">{checkResult.message}</p>
            </div>
          )}

          {/* General Error Message */}
          {error && !isNewUser && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-4 bg-green-100 text-green-800 py-2.5 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm border border-green-300"
          >
            {t('Quick Demo Login (Ramesh Patil)', 'त्वरित डेमो लॉगिन (रमेश पाटील)')}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">
                {t('or enter your registered credentials', 'किंवा आपले नोंदणीकृत तपशील टाका')}
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('Email or Mobile Number', 'ईमेल किंवा मोबाईल नंबर')} *
                </label>
                <button
                  type="button"
                  onClick={handleCheckUser}
                  disabled={checkingUser}
                  className="text-xs text-green-700 hover:text-green-800 underline font-medium"
                >
                  {checkingUser ? t('Checking...', 'तपासत आहे...') : t('Check Registration', 'नोंदणी तपासा')}
                </button>
              </div>
              <input
                type="text"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder={t('e.g. 9876543210 or farmer@mail.com', 'उदा. ९८७६५४३२१० किंवा farmer@mail.com')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Password', 'संकेतशब्द')} *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder={t('Enter password', 'संकेतशब्द टाका')}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="ml-2 text-gray-600 text-xs">
                  {t('Remember me', 'लक्षात ठेवा')}
                </span>
              </label>
              <Link
                to="/register"
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                {t('New user? Register', 'नवीन वापरकर्ता? नोंदणी करा')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex justify-center items-center shadow"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t('Login to Continue', 'पुढे जाण्यासाठी लॉगिन करा')
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            {t("Don't have an account?", 'खाते नाही का?')}{' '}
            <Link
              to={`/register${formData.email ? `?identifier=${encodeURIComponent(formData.email)}` : ''}`}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              {t('Register here', 'येथे नोंदणी करा')}
            </Link>
          </p>

          <div className="mt-6 pt-4 border-t text-center text-gray-500 text-xs">
            {t('Demo Farmer:', 'डेमो शेतकरी:')} <span className="font-mono text-gray-700">ramesh@demo.com</span> / <span className="font-mono text-gray-700">demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
