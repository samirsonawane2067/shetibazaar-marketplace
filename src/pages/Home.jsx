import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { products as staticProducts, categories } from '../data/products';
import { getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import Recommendations from '../components/Recommendations';

const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [popularProducts, setPopularProducts] = useState(staticProducts.slice(0, 8));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ limit: 8, sort: 'rating' });
        const fetched = data.products || data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setPopularProducts(fetched);
        }
      } catch (err) {
        // API not available, keep static products as fallback
        console.log('Using static products (API unavailable)');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                {t('MADE FOR MAHARASHTRA FARMERS', 'महाराष्ट्रातील शेतकऱ्यांसाठी')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t("India's marketplace for farmers.", 'शेतकऱ्यांसाठी महाराष्ट्राची डिजिटल बाजारपेठ')}
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                {t(
                  'Buy and sell agricultural products directly with farmers across Maharashtra.',
                  'महाराष्ट्रातील शेतकऱ्यांकडून शेतीशी संबंधित उत्पादने थेट खरेदी आणि विक्री करा.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/marketplace"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                >
                  {t('Explore Marketplace', 'बाजारपेठ पहा')} →
                </Link>
                <Link
                  to="/sell-product"
                  className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-center font-medium"
                >
                  {t('Sell Your Product', 'आपले उत्पादन विका')} +
                </Link>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center text-yellow-500">
                  <span className="text-2xl">★★★★★</span>
                  <span className="ml-2 text-gray-700 font-medium">4.8</span>
                </div>
                <span className="text-gray-500">
                  {t('Trusted by 2,400+ farmers', '२,४००+ शेतकऱ्यांचा विश्वास')}
                </span>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=85"
                alt="Farmer in field"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <p className="font-semibold text-gray-900">{t('Direct from the farm', 'थेट शेतातून')}</p>
                    <p className="text-sm text-gray-500">{t('Fair prices. Real people.', 'योग्य दर. खरे लोक.')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('Find what your farm needs', 'तुमच्या शेतासाठी आवश्यक गोष्टी शोधा')}
            </h2>
            <p className="text-gray-600 mt-2">
              {t('From trusted farmers near you', 'तुमच्या जवळच्या विश्वासू शेतकऱ्यांकडून')}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={(query) => navigate(`/marketplace?q=${encodeURIComponent(query)}`)} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-green-600 font-medium text-sm">
                {t('BROWSE BY NEED', 'गरजेनुसार शोधा')}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {t('Everything your farm needs.', 'तुमच्या शेतासाठी सर्व काही.')}
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              {t('View all categories', 'सर्व श्रेणी पहा')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-green-600 font-medium text-sm">
                {t('FRESH FROM THE FIELD', 'शेतातून थेट')}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {t('Popular this week.', 'या आठवड्यातील लोकप्रिय उत्पादने.')}
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              {t('See marketplace', 'बाजारपेठ पहा')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">
                {t('No products available right now.', 'सध्या कोणतीही उत्पादने उपलब्ध नाहीत.')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      {isAuthenticated && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Recommendations type="personalized" limit={6} />
          </div>
        </section>
      )}

      {/* Trending Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Recommendations type="trending" limit={6} />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('Why ShetiBazaar?', 'ShetiBazaar का?')}
            </h2>
            <p className="text-green-100 max-w-2xl mx-auto">
              {t(
                'Built around trust, local knowledge, and the people who keep Maharashtra growing.',
                'विश्वास, स्थानिक ज्ञान आणि महाराष्ट्राला समृद्ध करणा�्र्या लोकांसाठी तयार केलेले.'
              )}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-2">
                {t('Meet real farmers', 'खऱ्या शेतकऱ्यांना भेटा')}
              </h3>
              <p className="text-green-100">
                {t(
                  'Buy direct, know the story behind every listing.',
                  'थेट खरेदी करा, प्रत्येक उत्पादनाची गोष्ट जाणून घ्या.'
                )}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-2">
                {t('Fair, transparent pricing', 'योग्य आणि पारदर्शक दर')}
              </h3>
              <p className="text-green-100">
                {t(
                  'Better value for buyers. Better returns for growers.',
                  'खरेदीदारांसाठी चांगली किंमत. शेतकऱ्यांसाठी चांगला परतावा.'
                )}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-2">
                {t('Local when it matters', 'स्थानिक विश्वास')}
              </h3>
              <p className="text-green-100">
                {t(
                  'Discover trusted sellers across your district.',
                  'तुमच्या जिल्ह्यातील विश्वासू विक्रेते शोधा.'
                )}
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              to="/marketplace"
              className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              {t('Start exploring', 'शोध सुरू करा')} →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('Ready to grow together?', 'एकत्रित प्रगती करण्यास तयार आहात?')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t(
              'Join thousands of farmers already using ShetiBazaar to buy and sell agricultural products.',
              'शेतीशी संबंधित उत्पादने खरेदी आणि विक्री करण्यासाठी हजारो शेतकरी ShetiBazaar वापरत आहेत.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t('Register as Farmer', 'शेतकरी म्हणून नोंदणी करा')}
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              {t('Browse Products', 'उत्पादने पहा')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
