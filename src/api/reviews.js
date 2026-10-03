import client from './client';

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const { data } = await client.get(`/reviews/product/${productId}`, { params: { page, limit } });
  return data;
};

export const getSellerReviews = async (sellerId, page = 1, limit = 10) => {
  const { data } = await client.get(`/reviews/seller/${sellerId}`, { params: { page, limit } });
  return data;
};

export const createReview = async (reviewData) => {
  const { data } = await client.post('/reviews', reviewData);
  return data;
};

export const updateReview = async (reviewId, reviewData) => {
  const { data } = await client.put(`/reviews/${reviewId}`, reviewData);
  return data;
};

export const deleteReview = async (reviewId) => {
  const { data } = await client.delete(`/reviews/${reviewId}`);
  return data;
};
