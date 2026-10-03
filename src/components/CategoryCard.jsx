import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CategoryCard = ({ category }) => {
  const { t } = useLanguage();

  return (
    <Link
      to={`/marketplace?category=${encodeURIComponent(category.name)}`}
      className="group"
    >
      <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 aspect-square">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h3 className="text-xl font-bold text-white">
              {t(category.name, category.marathi)}
            </h3>
          </div>
          <p className="text-white/80 text-sm">
            {category.count} {t('listings', 'लिस्टिंग')}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
