import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            'Search seeds, tractor parts, cows, machinery...',
            'बियाणे, ट्रॅक्टर पार्ट्स, गायी, उपकरणे शोधा...'
          )}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </form>
  );
};

export default SearchBar;
