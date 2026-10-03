export const uploadImage = async (file) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return a placeholder image URL for demo
  return 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80';
};
