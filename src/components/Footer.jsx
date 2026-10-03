import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌱</span>
              <div>
                <span className="text-xl font-bold">ShetiBazaar</span>
                <p className="text-xs text-gray-400">शेती बाजार</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {t('Buy. Sell. Grow Together.', 'खरेदी करा • विक्री करा • प्रगती करा')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Quick Links', 'जलद लिंक्स')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Home', 'मुख्यपृष्ठ')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Marketplace', 'बाजारपेठ')}
                </Link>
              </li>
              <li>
                <Link to="/sell-product" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Sell Product', 'उत्पादन विक्रीसाठी टाका')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('About', 'आमच्याबद्दल')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Categories', 'श्रेणी')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace?category=Seeds" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Seeds', 'बियाणे')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Machinery" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Machinery', 'शेती उपकरणे')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Tractor Parts" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Tractor Parts', 'ट्रॅक्टर पार्ट्स')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Livestock" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('Livestock', 'पशुधन')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Contact', 'संपर्क')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <span className="block">{t('Maharashtra, India', 'महाराष्ट्र, भारत')}</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:hello@shetibazaar.in" className="hover:text-white transition-colors">
                  hello@shetibazaar.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 ShetiBazaar. {t('Frontend demo only.', 'फक्त फ्रंटएंड डेमो.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
