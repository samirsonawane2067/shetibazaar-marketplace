import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiPackage, FiShoppingCart, FiHeart, FiTrendingUp, FiPlus, FiEdit, FiLogOut } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const userProducts = JSON.parse(localStorage.getItem('userProducts') || '[]');
    const userOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setMyProducts(userProducts);
    setOrders(userOrders);
  }, []);

  // Demo data for charts
  const salesData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const activeListings = myProducts.filter(p => p.isActive !== false).length;
  const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const stats = [
    {
      label: t('Total Products', 'एकूण उत्पादने'),
      value: myProducts.length.toString(),
      icon: <FiPackage className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: t('Active Listings', 'सक्रिय लिस्टिंग'),
      value: activeListings.toString(),
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: t('Total Orders', 'एकूण ऑर्डर्स'),
      value: orders.length.toString(),
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      label: t('Total Sales', 'एकूण विक्री'),
      value: `₹${totalSales.toLocaleString('en-IN')}`,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
  ];


  const quickActions = [
    {
      label: t('Add Product', 'उत्पादन जोडा'),
      icon: <FiPlus className="w-5 h-5" />,
      link: '/sell-product',
      color: 'bg-green-600',
    },
    {
      label: t('My Products', 'माझी उत्पादने'),
      icon: <FiPackage className="w-5 h-5" />,
      link: '/my-products',
      color: 'bg-blue-600',
    },
    {
      label: t('Launch Product', 'उत्पादन लॉन्च करा'),
      icon: <FiTrendingUp className="w-5 h-5" />,
      link: '/launch-product',
      color: 'bg-purple-600',
    },
    {
      label: t('Edit Profile', 'प्रोफाइल संपादित करा'),
      icon: <FiEdit className="w-5 h-5" />,
      link: '/profile',
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('Welcome back,', 'पुन्हा स्वागत आहे,')} {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            {t('Here\'s what\'s happening with your farm.', 'आपल्या शेताची काय स्थिती आहे ते येथे आहे.')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('Quick Actions', 'जलद कृती')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {action.icon}
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('Sales Overview', 'विक्री आढावा')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('Recent Products', 'अलीकडील उत्पादने')}
            </h2>
            <div className="space-y-4">
              {myProducts.slice(0, 5).map((item) => (
                <div key={item._id || item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg overflow-hidden flex items-center justify-center">
                       {item.image || item.imageUrl ? (
                          <img src={item.image || item.imageUrl} alt="product" className="w-full h-full object-cover" />
                       ) : (
                          <span className="text-2xl">🌱</span>
                       )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t(item.name, item.marathi || item.nameMarathi || item.name)}
                      </p>
                      <p className="text-sm text-gray-500">₹{item.price}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${item.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.isActive !== false ? t('Active', 'सक्रिय') : t('Inactive', 'निष्क्रिय')}
                  </span>
                </div>
              ))}
              {myProducts.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">{t('No products yet.', 'अद्याप कोणतीही उत्पादने नाहीत.')}</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('Recent Orders', 'अलीकडील ऑर्डर्स')}
            </h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map((item) => (
                <div key={item._id || item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">ORD-{(item._id || item.id).toString().slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">₹{item.totalAmount || 0}</p>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">
                    {t(item.status || 'Pending', item.status || 'प्रलंबित')}
                  </span>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">{t('No orders yet.', 'अद्याप कोणतीही ऑर्डर नाही.')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
          >
            <FiLogOut className="w-5 h-5" />
            <span>{t('Logout', 'लॉगआउट')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
