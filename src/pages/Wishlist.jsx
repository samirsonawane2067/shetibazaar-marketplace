import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const Wishlist = () => {
  const { t } = useLanguage();
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('Your Wishlist', 'तुमची आवडती उत्पादने')}
          </h1>
          <EmptyState
            icon="♡"
            title={t('Nothing saved yet', 'अजून काहीही जतन केले नाही')}
            description={t(
              'Tap the heart on a product to keep it here.',
              'उत्पादन जतन करण्यासाठी हृदयावर टॅप करा.'
            )}
            actionText={t('Explore Products', 'उत्पादने पहा')}
            onAction={() => (window.location.href = '/marketplace')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Your Wishlist', 'तुमची आवडती उत्पादने')}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const product = item.product || item;
            return <ProductCard key={product.id || product._id} product={product} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
