import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../api/products';
import { products as staticProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import SavedSearchButton from '../components/SavedSearchButton';

const DEFAULT_PRICE_RANGE = { min: '', max: '' };

const Marketplace = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        const fetchedProducts = data.products || data;
        setProducts(Array.isArray(fetchedProducts) && fetchedProducts.length > 0 ? fetchedProducts : staticProducts);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedLocation(searchParams.get('location') || '');
    setPriceRange({
      min: searchParams.get('minPrice') || '',
      max: searchParams.get('maxPrice') || '',
    });
  }, [searchParams]);

  const locations = useMemo(() => {
    const allLocations = products.flatMap((product) =>
      String(product.location || '')
        .split(',')
        .map((location) => location.trim())
        .filter(Boolean)
    );

    return [...new Set(allLocations)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          (product.marathi || product.nameMarathi || '').toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          (product.seller || product.sellerName || '').toLowerCase().includes(query) ||
          (product.location || '').toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Location filter
    if (selectedLocation) {
      const locationQuery = selectedLocation.toLowerCase();
      filtered = filtered.filter((product) => product.location?.toLowerCase().includes(locationQuery));
    }

    // Price filter
    const minimumPrice = Number.parseFloat(priceRange.min);
    const maximumPrice = Number.parseFloat(priceRange.max);
    filtered = filtered.filter((product) => {
      const productPrice = Number(product.price);
      return (
        (!Number.isFinite(minimumPrice) || productPrice >= minimumPrice) &&
        (!Number.isFinite(maximumPrice) || productPrice <= maximumPrice)
      );
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Recommended - no sorting
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLocation, priceRange, sortBy, products]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('Marketplace', 'बाजारपेठ')}
          </h1>
          <p className="text-gray-600">
            {t('Find good things, grow good things.', 'चांगले शोधा, चांगले पिकवा.')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>
          {isAuthenticated && (
            <SavedSearchButton
              searchParams={{
                q: searchQuery,
                category: selectedCategory,
                location: selectedLocation,
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                sortBy
              }}
            />
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:hidden">
            <details className="bg-white rounded-xl shadow-sm p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                {t('Filters', 'फिल्टर')}
              </summary>
              <div className="mt-4">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  locations={locations}
                />
              </div>
            </details>
          </div>
          <div className="hidden lg:block">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              locations={locations}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <span className="text-gray-600">
                  {searchQuery
                    ? `${t('Results for', 'यासाठी निकाल')} "${searchQuery}"`
                    : t('Latest listings', 'नवीन लिस्टिंग')}
                </span>
                <span className="ml-2 text-gray-900 font-medium">
                  ({filteredProducts.length})
                </span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recommended">{t('Sort: Recommended', 'क्रम: शिफारस')}</option>
                <option value="price-low">{t('Price: Low to high', 'किंमत: कमी ते जास्त')}</option>
                <option value="price-high">{t('Price: High to low', 'किंमत: जास्त ते कमी')}</option>
                <option value="rating">{t('Rating', 'रेटिंग')}</option>
              </select>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🔍"
                title={t('No products found', 'कोणतेही उत्पादन सापडले नाहीत')}
                description={t(
                  'Try adjusting your filters or search terms',
                  'आपले फिल्टर किंवा शोध शब्द समायोजित करून पहा'
                )}
                actionText={t('Clear filters', 'फिल्टर साफ करा')}
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLocation('');
                  setPriceRange(DEFAULT_PRICE_RANGE);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
