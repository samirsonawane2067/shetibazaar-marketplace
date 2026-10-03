import { useLanguage } from '../context/LanguageContext';
import { categories } from '../data/products';

const FALLBACK_LOCATIONS = [
  'Pune', 'Nashik', 'Sangamner', 'Ahilyanagar', 'Kolhapur', 'Satara',
  'Sangli', 'Solapur', 'Nagpur', 'Jalgaon', 'Akola', 'Beed', 'Nanded',
  'Latur', 'Amravati',
];

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Rs 0 - Rs 1,000', min: 0, max: 1000 },
  { label: 'Rs 1,000 - Rs 10,000', min: 1000, max: 10000 },
  { label: 'Rs 10,000 - Rs 50,000', min: 10000, max: 50000 },
  { label: 'Rs 50,000+', min: 50000, max: '' },
];

const FilterSidebar = ({
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  priceRange,
  onPriceRangeChange,
  locations = [],
}) => {
  const { t } = useLanguage();
  const availableLocations = locations.length > 0 ? locations : FALLBACK_LOCATIONS;
  const isRangeActive = (range) => String(priceRange.min) === String(range.min)
    && String(priceRange.max) === String(range.max);

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-24">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">{t('Category', 'Category')}</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onCategoryChange('All')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === 'All' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('All Categories', 'All Categories')}
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === category.name ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {t(category.name, category.marathi)}
                </span>
                <span className="text-xs opacity-70">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">{t('Location', 'Location')}</h3>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('All Locations', 'All Locations')}</option>
            {availableLocations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">{t('Price Range', 'Price Range')}</h3>
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <button
                type="button"
                key={range.label}
                onClick={() => onPriceRangeChange({ min: range.min, max: range.max })}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isRangeActive(range) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
              placeholder={t('Min price', 'Min price')}
              aria-label={t('Minimum price', 'Minimum price')}
              className="min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
              placeholder={t('Max price', 'Max price')}
              aria-label={t('Maximum price', 'Maximum price')}
              className="min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
