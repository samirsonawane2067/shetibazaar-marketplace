import client from './client';

export const getWishlist = async () => {
  const { data } = await client.get('/wishlist');
  return data;
};

export const toggleWishlist = async (productId) => {
  const { data } = await client.post('/wishlist', { productId });
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await client.delete(`/wishlist/${productId}`);
  return data;
};
