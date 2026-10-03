import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getMyProducts, deleteProduct } from '../api/products';
import { FiEye, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const MyProducts = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getMyProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // Fallback to localStorage if API fails
        const userProducts = JSON.parse(localStorage.getItem('userProducts') || '[]');
        setProducts(userProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isAuthenticated]);

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      const data = await getMyProducts();
      setProducts(data || []);
      setShowDeleteModal(null);
      alert(t('Product deleted successfully', 'उत्पादन यशस्वीरित्या हटवले'));
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Fallback to localStorage
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('userProducts', JSON.stringify(updatedProducts));
      setShowDeleteModal(null);
      alert(t('Product deleted successfully', 'उत्पादन यशस्वीरित्या हटवले'));
    }
  };

  const handleToggleStatus = (productId) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, active: !p.active } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('userProducts', JSON.stringify(updatedProducts));
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('My Products', 'माझी उत्पादने')}
          </h1>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('No products listed yet', 'अजून कोणतेही उत्पादन लिस्ट केले नाही')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('Start listing your products to reach buyers across Maharashtra', 'महाराष्ट्रभर खरेदीदारांपर्यंत पोहोचण्यासाठी आपली उत्पादने लिस्ट करण्यास सुरुवात करा')}
            </p>
            <Link
              to="/sell-product"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t('List Your First Product', 'आपले पहिले उत्पादन लिस्ट करा')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('My Products', 'माझी उत्पादने')}
          </h1>
          <Link
            to="/sell-product"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('Add New Product', 'नवीन उत्पादन जोडा')}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Product', 'उत्पादन')}
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
                {products.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image || product.imageUrl}
                          alt={product.productName || product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName || product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.productNameMarathi || product.marathi || product.nameMarathi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{parseInt(product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`flex items-center space-x-1 ${
                          product.active !== false ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {product.active !== false ? (
                          <FiToggleRight className="w-5 h-5" />
                        ) : (
                          <FiToggleLeft className="w-5 h-5" />
                        )}
                        <span className="text-sm">
                          {product.active !== false ? t('Active', 'सक्रिय') : t('Inactive', 'निष्क्रिय')}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          title={t('View', 'पहा')}
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700"
                          title={t('Edit', 'संपादित करा')}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(product.id)}
                          className="text-red-600 hover:text-red-700"
                          title={t('Delete', 'हटवा')}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('Delete Product', 'उत्पादन हटवा')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('Are you sure you want to delete this product? This action cannot be undone.', 'आपली खात्री आहे की आपण हे उत्पादन हटवू इच्छिता? ही कृती पूर्ववत केली जाऊ शकत नाही.')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('Cancel', 'रद्द करा')}
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('Delete', 'हटवा')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
