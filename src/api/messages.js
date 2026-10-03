import client from './client';

export const getConversation = async (userId, productId = null, page = 1, limit = 50) => {
  const { data } = await client.get(`/messages/conversation/${userId}`, { 
    params: { productId, page, limit } 
  });
  return data;
};

export const getConversations = async () => {
  const { data } = await client.get('/messages/conversations');
  return data;
};

export const sendMessage = async (messageData) => {
  const { data } = await client.post('/messages', messageData);
  return data;
};

export const markAsRead = async (userId) => {
  const { data } = await client.put(`/messages/read/${userId}`);
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await client.get('/messages/unread/count');
  return data;
};
