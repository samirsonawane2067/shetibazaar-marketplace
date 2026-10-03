import client from './client';

export const getCart = async () => {
  const { data } = await client.get('/cart');
  return data;
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await client.post('/cart', { productId, product_id: productId, quantity });
  return data;
};

export const updateCartItem = async (id, quantity) => {
  const { data } = await client.put(`/cart/${id}`, { quantity });
  return data;
};

export const removeFromCart = async (id) => {
  const { data } = await client.delete(`/cart/${id}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await client.delete('/cart');
  return data;
};
