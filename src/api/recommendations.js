import client from './client';

export const trackBehavior = async (behaviorData) => {
  const { data } = await client.post('/recommendations/track', behaviorData);
  return data;
};

export const getRecommendations = async (limit = 10) => {
  const { data } = await client.get('/recommendations', { params: { limit } });
  return data;
};

export const getTrendingProducts = async (limit = 10, days = 7) => {
  const { data } = await client.get('/recommendations/trending', { params: { limit, days } });
  return data;
};

export const getSimilarProducts = async (productId, limit = 6) => {
  const { data } = await client.get(`/recommendations/similar/${productId}`, { params: { limit } });
  return data;
};
