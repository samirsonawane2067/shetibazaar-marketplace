import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getProductPriceHistory, getPriceStats } from '../api/priceHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceHistoryChart = ({ productId }) => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [productId, days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        getProductPriceHistory(productId, days),
        getPriceStats(productId, days),
      ]);
      setHistory(historyData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.map((item) => ({
    date: new Date(item.recorded_at).toLocaleDateString(),
    price: parseFloat(item.price),
  }));

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('No price history available', 'किंमत इतिहास उपलब्ध नाही')}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('Price History', 'किंमत इतिहास')}
        </h3>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="7">{t('7 Days', '7 दिवस')}</option>
          <option value="30">{t('30 Days', '30 दिवस')}</option>
          <option value="90">{t('90 Days', '90 दिवस')}</option>
        </select>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">{t('Average', 'सरासरी')}</div>
            <div className="font-semibold text-gray-900">₹{stats.avg_price?.toFixed(2) || 0}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">{t('Lowest', 'किमान')}</div>
            <div className="font-semibold text-gray-900">₹{stats.min_price || 0}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">{t('Highest', 'कमाल')}</div>
            <div className="font-semibold text-gray-900">₹{stats.max_price || 0}</div>
          </div>
        </div>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
