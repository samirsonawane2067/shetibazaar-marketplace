import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createSavedSearch } from '../api/savedSearches';
import { FiBookmark } from 'react-icons/fi';

const SavedSearchButton = ({ searchParams, onSave }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await createSavedSearch({
        name,
        search_params: searchParams,
      });
      setName('');
      setIsOpen(false);
      if (onSave) onSave();
    } catch (err) {
      console.error('Failed to save search:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FiBookmark />
        {t('Save Search', 'शोध जतन करा')}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border z-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {t('Save This Search', 'हा शोध जतन करा')}
            </h3>
            <form onSubmit={handleSave}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Search name', 'शोधाचे नाव')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('Cancel', 'रद्द करा')}
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? t('Saving...', 'जतन करत आहे...') : t('Save', 'जतन करा')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default SavedSearchButton;
