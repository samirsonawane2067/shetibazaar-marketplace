import client from './client';

export const getProductPriceHistory = async (productId, days = 30) => {
  const { data } = await client.get(`/price-history/product/${productId}`, { params: { days } });
  return data;
};

export const recordPriceHistory = async (priceData) => {
  const { data } = await client.post('/price-history', priceData);
  return data;
};

export const getPriceStats = async (productId, days = 30) => {
  const { data } = await client.get(`/price-history/stats/${productId}`, { params: { days } });
  return data;
};
