import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getRecommendations, getTrendingProducts, getSimilarProducts, trackBehavior } from '../api/recommendations';
import ProductCard from './ProductCard';
import { FiTrendingUp, FiHeart } from 'react-icons/fi';

const Recommendations = ({ type = 'personalized', productId = null, limit = 6 }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [type, productId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let data;
      switch (type) {
        case 'trending':
          data = await getTrendingProducts(limit);
          break;
        case 'similar':
          data = await getSimilarProducts(productId, limit);
          break;
        default:
          data = await getRecommendations(limit);
      }
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    if (type !== 'similar') {
      trackBehavior({
        product_id: product.id,
        action_type: 'view',
        metadata: { source: type },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const getTitle = () => {
    switch (type) {
      case 'trending':
        return (
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-600" />
            {t('Trending Products', 'लोकप्रिय उत्पादने')}
          </div>
        );
      case 'similar':
        return t('Similar Products', 'समान उत्पादने');
      default:
        return (
          <div className="flex items-center gap-2">
            <FiHeart className="text-green-600" />
            {t('Recommended for You', 'तुमच्यासाठी शिफारस केलेले')}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {getTitle()}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
