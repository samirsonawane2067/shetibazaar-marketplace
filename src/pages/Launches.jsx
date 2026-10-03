import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { getLaunches } from '../api/launches';
import { getFullImageUrl } from '../utils/imageUrl';

const Launches = () => {
  const [launches, setLaunches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getLaunches().then(setLaunches).catch(() => setError('Unable to load product launches'));
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="kicker">COMMUNITY UPDATES</span>
          <h1>Product launches</h1>
        </div>
        <Link className="primary" to="/launch-product">Launch a product</Link>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!error && launches.length === 0 && (
        <div className="empty"><h3>No launches yet</h3><p>Be the first seller to share a product launch.</p></div>
      )}

      <div className="product-grid">
        {launches.map((launch) => {
          const image = getFullImageUrl(launch.image_url || launch.product_image);
          return (
            <article className="product-card" key={launch.id}>
              <div className="product-image">
                {image ? <img src={image} alt={launch.title} /> : <div className="empty">🌱</div>}
              </div>
              <div className="product-info">
                <div className="product-category"><span>Launch</span><span>{launch.launch_date}</span></div>
                <h3>{launch.title}</h3>
                <p className="seller">{launch.description}</p>
                <p className="seller"><FiMapPin /> {launch.seller_name}</p>
                <div className="price-row">
                  <strong>₹{launch.special_price || launch.product_price}</strong>
                  <Link className="text-link" to={`/product/${launch.product_id}`}>View product</Link>
                </div>
                <div className="contact-actions">
                  {launch.seller_phone && <a href={`tel:${launch.seller_phone}`}><FiPhone /> Call</a>}
                  {launch.seller_phone && <a href={`https://wa.me/${String(launch.seller_phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><FiMessageCircle /> WhatsApp</a>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Launches;
