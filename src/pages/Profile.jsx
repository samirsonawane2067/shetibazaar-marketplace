import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiLogOut,
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiCamera,
  FiTrash2,
  FiUpload,
  FiCheck
} from 'react-icons/fi';
import { uploadProfilePhoto } from '../api/auth';
import { getFullImageUrl } from '../utils/imageUrl';

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400; // 400x400 max for crisp, lightweight profile avatars
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('');
  });
};

const Profile = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, updateUser, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const photoInputRef = useRef(null);
  
  const [photoPreview, setPhotoPreview] = useState(() => {
    return user?.avatarUrl || user?.avatar_url || localStorage.getItem(`avatar_backup_${user?.id || 'user'}`) || '';
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    farmName: user?.farmName || '',
    location: user?.location || '',
    avatarUrl: user?.avatarUrl || user?.avatar_url || '',
  });

  // Keep photoPreview and formData synchronized when user loads
  useEffect(() => {
    const avatar = user?.avatarUrl || user?.avatar_url || localStorage.getItem(`avatar_backup_${user?.id || 'user'}`) || '';
    if (avatar) {
      setPhotoPreview(avatar);
      setImageError(false);
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        mobile: user.mobile || user.phone || prev.mobile,
        farmName: user.farmName || user.farm_name || prev.farmName,
        location: user.location || user.district || prev.location,
        avatarUrl: avatar || prev.avatarUrl,
      }));
    }
  }, [user]);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('Please login to view your profile', 'कृपया आपले प्रोफाइल पाहण्यासाठी लॉगिन करा')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('You need to be logged in to access your profile.', 'प्रोफाइल पाहण्यासाठी लॉगिन आवश्यक आहे.')}
          </p>
          <Link
            to="/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('Login', 'लॉगिन')}
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())) {
      setErrorMsg(t('Please choose a JPG, PNG, or WebP image.', 'कृपया JPG, PNG किंवा WebP इमेज निवडा.'));
      event.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(t('Image must be under 8 MB.', 'इमेज ८ MB पेक्षा कमी असावी.'));
      event.target.value = '';
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      setImageError(false);
      const base64Photo = await compressImage(file);
      
      // Save local backup immediately for instant guaranteed display
      try {
        localStorage.setItem('user_avatar_backup', base64Photo);
        if (user?.id) localStorage.setItem(`user_avatar_backup_${user.id}`, base64Photo);
      } catch (e) {
        console.warn('LocalStorage avatar cache error:', e);
      }

      setPhotoPreview(base64Photo);
      setFormData((prev) => ({ ...prev, avatarUrl: base64Photo }));

      let finalAvatarUrl = base64Photo;
      try {
        const uploadRes = await uploadProfilePhoto(file);
        if (uploadRes?.avatar_url) {
          finalAvatarUrl = uploadRes.avatar_url;
        }
      } catch (err) {
        console.warn('Server photo upload skipped, saved locally:', err);
      }

      await updateUser({ ...formData, avatarUrl: finalAvatarUrl });
      updateAvatar(finalAvatarUrl);
      setPhotoPreview(finalAvatarUrl);

      setSuccessMsg(t('Profile photo updated successfully!', 'प्रोफाइल फोटो यशस्वीरित्या जोडला गेला!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update photo:', err);
      setErrorMsg(t('Could not save photo. Please try again.', 'फोटो सेव्ह करता आला नाही. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      setPhotoPreview('');
      setImageError(true);
      localStorage.removeItem('user_avatar_backup');
      if (user?.id) localStorage.removeItem(`user_avatar_backup_${user.id}`);
      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
      await updateUser({ ...formData, avatarUrl: '' });
      updateAvatar('');
      setSuccessMsg(t('Profile photo removed.', 'प्रोफाइल फोटो काढला.'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUser(formData);
      setIsEditing(false);
      setSuccessMsg(t('Profile updated successfully!', 'प्रोफाइल यशस्वीरित्या अपडेट केले!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsEditing(false);
      setSuccessMsg(t('Profile updated!', 'प्रोफाइल अपडेट केले!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      farmName: user?.farmName || '',
      location: user?.location || '',
      avatarUrl: user?.avatarUrl || user?.avatar_url || '',
    });
    const backup = localStorage.getItem(`user_avatar_backup_${user?.id}`) || localStorage.getItem('user_avatar_backup');
    setPhotoPreview(user?.avatarUrl || user?.avatar_url || backup || '');
    setImageError(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const localBackup = (user?.id && localStorage.getItem(`user_avatar_backup_${user.id}`)) || localStorage.getItem('user_avatar_backup') || '';
  const rawAvatar = photoPreview || user?.avatarUrl || user?.avatar_url || localBackup;
  const currentPhoto = getFullImageUrl(rawAvatar);

  const quickLinks = [
    { to: '/dashboard', icon: <FiGrid className="w-5 h-5" />, label: t('Dashboard', 'डॅशबोर्ड'), color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { to: '/my-products', icon: <FiPackage className="w-5 h-5" />, label: t('My Products', 'माझी उत्पादने'), color: 'bg-green-50 text-green-600 hover:bg-green-100' },
    { to: '/sell-product', icon: <FiShoppingBag className="w-5 h-5" />, label: t('Sell Product', 'उत्पादन विका'), color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
            <FiCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-100">
          {/* Green Banner */}
          <div className="h-32 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 relative">
            {/* Avatar with Camera badge */}
            <div className="absolute -bottom-14 left-6">
              <div className="relative group">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-28 h-28 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center cursor-pointer overflow-hidden relative group-hover:ring-4 group-hover:ring-green-300 transition-all"
                  title={t('Click to upload profile photo', 'फोटो अपलोड करण्यासाठी येथे क्लिक करा')}
                >
                  {uploadingPhoto ? (
                    <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : !imageError && currentPhoto ? (
                    <img
                      src={currentPhoto}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const backup = (user?.id && localStorage.getItem(`user_avatar_backup_${user.id}`)) || localStorage.getItem('user_avatar_backup');
                        if (backup && e.target.src !== backup) {
                          e.target.src = backup;
                        } else {
                          setImageError(true);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-green-700">{getInitials(user?.name)}</span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold">
                    <FiCamera className="w-5 h-5 mb-0.5" />
                    <span>{t('Change', 'बदला')}</span>
                  </div>
                </div>

                {/* Permanent Camera Button Badge */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute right-0 bottom-1 w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white border-2 border-white shadow-md flex items-center justify-center transition-transform"
                  title={t('Add profile photo', 'प्रोफाइल फोटो जोडा')}
                >
                  <FiCamera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    🌾 {t('Verified Farmer', 'सत्यापित शेतकरी')}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {user?.farmName && <span className="font-semibold text-green-700">{user.farmName}</span>}
                  {user?.farmName && user?.location && ' • '}
                  {user?.location || 'Maharashtra, India'}
                </p>

                {/* Quick Photo Upload & Remove Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                  >
                    <FiUpload className="w-3.5 h-3.5" />
                    <span>{currentPhoto ? t('Change Photo', 'फोटो बदला') : t('Upload Photo', 'फोटो जोडा')}</span>
                  </button>

                  {currentPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                      title={t('Remove Photo', 'फोटो काढा')}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>{t('Remove', 'काढा')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Profile Action Buttons */}
              <div className="self-start sm:self-center">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    <FiEdit2 className="w-4 h-4 text-green-600" />
                    <span>{t('Edit Profile', 'प्रोफाइल संपादित करा')}</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{saving ? t('Saving...', 'सेव्ह करत आहे...') : t('Save', 'सेव्ह करा')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                    >
                      <FiX className="w-4 h-4" />
                      <span>{t('Cancel', 'रद्द करा')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t('Profile Details', 'प्रोफाइल तपशील')}
          </h2>

          <div className="space-y-5">
            {/* Profile Photo Option (in Edit Mode) */}
            {isEditing && (
              <div className="flex items-start space-x-4 p-4 bg-green-50/60 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-white rounded-full border-2 border-green-500 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                  {currentPhoto ? (
                    <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FiCamera className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    {t('Profile Photo', 'प्रोफाइल फोटो')}
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    {t('Upload a photo from your computer or paste an image URL.', 'आपल्या कॉम्प्युटरवरून फोटो अपलोड करा किंवा इमेज लिंक टाका.')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <FiUpload className="w-3.5 h-3.5" />
                      <span>{uploadingPhoto ? t('Processing...', 'प्रक्रिया सुरू आहे...') : t('Upload New Photo', 'नवीन फोटो अपलोड करा')}</span>
                    </button>
                    {currentPhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>{t('Remove', 'काढा')}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => {
                      handleChange(e);
                      setPhotoPreview(e.target.value);
                    }}
                    placeholder={t('Or paste image URL (https://...)', 'किंवा इमेज लिंक टाका (https://...)')}
                    className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUser className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('Full Name', 'पूर्ण नाव')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.name || '—'}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('Email', 'ईमेल')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    disabled
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.email || '—'}</p>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiPhone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('Mobile Number', 'मोबाईल नंबर')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="9876543210"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.mobile || '—'}</p>
                )}
              </div>
            </div>

            {/* Farm Name */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiHome className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('Farm Name', 'शेताचे नाव')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('e.g. Patil Agro Farm', 'उदा. पाटील अॅग्रो फार्म')}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.farmName || '—'}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t('Location', 'ठिकाण')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('Village, District, Maharashtra', 'गाव, जिल्हा, महाराष्ट्र')}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.location || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('Quick Links', 'जलद दुवे')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-colors ${link.color}`}
              >
                {link.icon}
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
        >
          <FiLogOut className="w-5 h-5" />
          <span>{t('Logout', 'लॉगआउट')}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
