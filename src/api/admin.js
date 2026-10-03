import client from './client';

export const getAdminStats = async () => {
  const { data } = await client.get('/admin/stats');
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await client.get('/admin/users');
  return data;
};

export const getAdminProducts = async () => {
  const { data } = await client.get('/admin/products');
  return data;
};

export const approveProduct = async (id, isApproved) => {
  const { data } = await client.put(`/admin/products/${id}/approve`, { isApproved });
  return data;
};

export const deleteAdminProduct = async (id) => {
  const { data } = await client.delete(`/admin/products/${id}`);
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await client.get('/admin/orders');
  return data;
};
