import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../api/messages';
import { FiMessageCircle } from 'react-icons/fi';

const ChatButton = ({ onClick }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors relative"
    >
      <FiMessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
