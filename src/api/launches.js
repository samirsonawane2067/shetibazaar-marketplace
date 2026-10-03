import client from './client';

export const getLaunches = async () => {
  const { data } = await client.get('/launches');
  return data;
};

export const getLaunchProducts = async () => {
  const { data } = await client.get('/launches/mine');
  return data;
};

export const createLaunch = async (launchData) => {
  const formData = new FormData();
  Object.entries(launchData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  const { data } = await client.post('/launches', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
