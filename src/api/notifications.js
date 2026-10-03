import client from './client';

export const getNotifications = async (unreadOnly = false, limit = 20, offset = 0) => {
  const { data } = await client.get('/notifications', { 
    params: { unread_only: unreadOnly, limit, offset } 
  });
  return data;
};

export const markAsRead = async (notificationId) => {
  const { data } = await client.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await client.put('/notifications/read-all');
  return data;
};

export const deleteNotification = async (notificationId) => {
  const { data } = await client.delete(`/notifications/${notificationId}`);
  return data;
};
