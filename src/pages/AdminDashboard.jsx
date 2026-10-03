import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FiUsers, FiPackage, FiShoppingCart, FiTrendingUp, FiLogOut, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Load demo data
    const userProducts = JSON.parse(localStorage.getItem('userProducts') || '[]');
    setRecentProducts(userProducts.slice(0, 10));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const handleApproveProduct = (id, isApproved) => {
    const updatedProducts = recentProducts.map((p) =>
      p.id === id ? { ...p, status: isApproved ? 'Approved' : 'Rejected' } : p
    );
    setRecentProducts(updatedProducts);
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm(t('Are you sure you want to delete this product?', 'तुम्हाला खात्री आहे का?'))) return;
    const updatedProducts = recentProducts.filter((p) => p.id !== id);
    setRecentProducts(updatedProducts);
  };

  // Demo stats
  const stats = [
    {
      label: t('Total Farmers', 'एकूण शेतकरी'),
      value: '2,450',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: t('Total Products', 'एकूण उत्पादने'),
      value: '8,320',
      icon: <FiPackage className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: t('Total Orders', 'एकूण ऑर्डर्स'),
      value: '15,680',
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      label: t('Total Sales', 'एकूण विक्री'),
      value: '₹45.2L',
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
  ];

  const salesData = [
    { month: 'Jan', sales: 3200000 },
    { month: 'Feb', sales: 4100000 },
    { month: 'Mar', sales: 3800000 },
    { month: 'Apr', sales: 5200000 },
    { month: 'May', sales: 4900000 },
    { month: 'Jun', sales: 6100000 },
  ];

  const categoryData = [
    { name: 'Seeds', value: 35, color: '#16a34a' },
    { name: 'Machinery', value: 25, color: '#2563eb' },
    { name: 'Livestock', value: 20, color: '#9333ea' },
    { name: 'Fertilizers', value: 12, color: '#ea580c' },
    { name: 'Others', value: 8, color: '#6b7280' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('Admin Dashboard', 'अॅडमिन डॅशबोर्ड')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('Manage ShetiBazaar platform', 'ShetiBazaar प्लॅटफॉर्म व्यवस्थापित करा')}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
          >
            <FiLogOut className="w-5 h-5" />
            <span>{t('Logout', 'लॉगआउट')}</span>
          </button>
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

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('Category Distribution', 'श्रेणी वितरण')}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('Recent Products', 'अलीकडील उत्पादने')}
            </h2>
            <Link
              to="/admin/products"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {t('View All', 'सर्व पहा')} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Product', 'उत्पादन')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Seller', 'विक्रेता')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Category', 'श्रेणी')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Price', 'किंमत')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Status', 'स्थिती')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Actions', 'कृती')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentProducts.slice(0, 10).map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.seller || product.sellerName || (product.userId ? product.userId.name : 'Unknown')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status || (product.isActive ? 'Approved' : 'Pending'))}`}>
                        {product.status || (product.isActive ? 'Approved' : 'Pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleApproveProduct(product.id || product._id, true)} className="text-green-600 hover:text-green-700" title="Approve">
                          <FiCheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleApproveProduct(product.id || product._id, false)} className="text-red-600 hover:text-red-700" title="Reject">
                          <FiXCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id || product._id)} className="text-gray-600 hover:text-gray-700" title="Delete">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentProducts.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
