const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const uploadPublicFile = async (file, folder, filename) => {
  if (!supabase) {
    throw new Error('Supabase Storage is not configured');
  }

  const filePath = `${folder}/${filename}`;
  const { error } = await supabase.storage.from(bucketName).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

module.exports = { uploadPublicFile };
