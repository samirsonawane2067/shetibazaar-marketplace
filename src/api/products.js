import client from './client';

const getImageUrl = (image) => {
  if (!image || image.startsWith('http')) return image;
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${apiOrigin}${image.startsWith('/') ? image : `/${image}`}`;
};

const parseDetails = (details) => {
  if (Array.isArray(details)) return details;
  if (typeof details !== 'string') return [];

  try {
    const parsed = JSON.parse(details);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const normalizeProduct = (product) => {
  if (!product) return product;

  const image = getImageUrl(product.image || product.imageUrl || product.image_url);
  const seller = product.seller || product.sellerName || product.seller_name;
  const sellerPhone = product.phone || product.sellerPhone || product.seller_phone;

  return {
    ...product,
    image,
    imageUrl: image,
    seller,
    sellerName: seller,
    sellerPhone,
    details: parseDetails(product.details),
  };
};

export const getProducts = async (params) => {
  const { data } = await client.get('/products', { params });
  const productList = data.products || data;
  const normalizedProducts = Array.isArray(productList) ? productList.map(normalizeProduct) : [];
  return Array.isArray(data) ? normalizedProducts : { ...data, products: normalizedProducts };
};

export const getProduct = async (id) => {
  const { data } = await client.get(`/products/${id}`);
  return normalizeProduct(data);
};

export const createProduct = async (productData) => {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    if (key === 'details') {
      formData.append(key, JSON.stringify(productData[key]));
    } else {
      formData.append(key, productData[key]);
    }
  });
  const { data } = await client.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await client.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await client.delete(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await client.get('/products/user/mine');
  return data;
};
