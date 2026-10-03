import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getProductReviews } from '../api/reviews';
import StarRating from './StarRating';
import { FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ReviewList = ({ productId, limit = 5 }) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getProductReviews(productId, page, limit);
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('No reviews yet', 'अजून कोणतेही समीक्षा नाहीत')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium text-gray-900">{review.reviewer_name}</div>
              <div className="text-sm text-gray-500">{review.reviewer_village}</div>
            </div>
            <StarRating rating={review.rating} readonly size="text-sm" />
          </div>
          
          {review.title && (
            <h4 className="font-semibold text-gray-800 mb-1">{review.title}</h4>
          )}
          
          <p className="text-gray-600 text-sm">{review.comment}</p>
          
          {review.is_verified_purchase && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <FiMessageSquare size={12} />
              {t('Verified Purchase', 'पडताळित खरेदी')}
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-400">
            {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}

      {total > reviews.length && (
        <button
          onClick={loadMore}
          className="w-full py-2 text-green-600 hover:text-green-700 font-medium"
        >
          {t('Load More Reviews', 'अधिक समीक्षा लोड करा')}
        </button>
      )}
    </div>
  );
};

export default ReviewList;
