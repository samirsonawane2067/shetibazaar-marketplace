import client from './client';

export const loginUser = async (emailOrPhone, password) => {
  const isEmail = String(emailOrPhone).includes('@');
  const payload = {
    email: isEmail ? emailOrPhone : undefined,
    phone: !isEmail ? emailOrPhone : undefined,
    identifier: emailOrPhone,
    password,
  };
  const { data } = await client.post('/auth/login', payload);
  return data;
};

export const registerUser = async (userData) => {
  const payload = {
    ...userData,
    phone: userData.phone || userData.mobile,
    mobile: userData.mobile || userData.phone,
  };
  const { data } = await client.post('/auth/register', payload);
  return data;
};

export const checkUser = async (identifier) => {
  const { data } = await client.post('/auth/check-user', { identifier });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await client.get('/users/me');
  return data;
};

export const updateProfile = async (userData) => {
  const { mobile, farmName, avatarUrl, ...rest } = userData;
  const { data } = await client.put('/users/profile', {
    ...rest,
    phone: userData.phone || mobile,
    farm_name: userData.farm_name || farmName,
    avatar_url: userData.avatar_url || avatarUrl,
  });
  return data;
};

export const uploadProfilePhoto = async (photo) => {
  const formData = new FormData();
  formData.append('photo', photo);
  const { data } = await client.post('/users/profile/photo', formData);
  return data;
};

export const adminLogin = async (email, password) => {
  const { data } = await client.post('/auth/admin/login', { email, password });
  return data;
};
