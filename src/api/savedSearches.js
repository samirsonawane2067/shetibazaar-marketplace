import client from './client';

export const getSavedSearches = async () => {
  const { data } = await client.get('/saved-searches');
  return data;
};

export const createSavedSearch = async (searchData) => {
  const { data } = await client.post('/saved-searches', searchData);
  return data;
};

export const updateSavedSearch = async (searchId, searchData) => {
  const { data } = await client.put(`/saved-searches/${searchId}`, searchData);
  return data;
};

export const deleteSavedSearch = async (searchId) => {
  const { data } = await client.delete(`/saved-searches/${searchId}`);
  return data;
};
