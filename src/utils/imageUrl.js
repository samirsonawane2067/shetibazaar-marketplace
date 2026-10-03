const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const serverUrl = apiBaseUrl.replace(/\/api\/?$/, '');

// Converts backend upload paths such as /uploads/profiles/avatar.jpg into URLs
// the browser can load, while preserving external URLs and local previews.
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  if (/^(https?:|data:|blob:)/i.test(imageUrl)) {
    return imageUrl;
  }

  return `${serverUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};
