import client from './client';

export const createOrder = async (orderData) => {
  const { data } = await client.post('/orders', orderData);
  return data;
};

export const getOrders = async () => {
  const { data } = await client.get('/orders');
  return data;
};

export const getOrder = async (id) => {
  const { data } = await client.get(`/orders/${id}`);
  return data;
};
