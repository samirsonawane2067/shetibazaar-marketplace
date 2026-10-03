import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createReview } from '../api/reviews';
import StarRating from './StarRating';

const ReviewForm = ({ productId, sellerId, onReviewSubmitted, existingReview = null }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError(t('Please select a rating', 'कृपया रेटिंग निवडा'));
      return;
    }

    setSubmitting(true);

    try {
      await createReview({
        product_id: productId,
        rating,
        title,
        comment,
      });
      onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to submit review', 'समीक्षा सादर करण्यात अयशस्वी'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? t('Update Your Review', 'तुमची समीक्षा अपडेट करा') : t('Write a Review', 'समीक्षा लिहा')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Rating', 'रेटिंग')} *
          </label>
          <StarRating rating={rating} onRate={setRating} size="text-3xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Title', 'शीर्षक')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('Summarize your experience', 'तुमचा अनुभव सारांशित करा')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Your Review', 'तुमची समीक्षा')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('Share your experience with this product', 'या उत्पादनासह तुमचा अनुभव शेअर करा')}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('Submitting...', 'सादर करत आहे...') : t('Submit Review', 'समीक्षा सादर करा')}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
