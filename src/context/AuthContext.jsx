import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, updateProfile } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore and verify user session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (err) {
        console.warn('Session verification notice:', err?.response?.data?.message || err.message);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (emailOrPhone, password) => {
    try {
      setError(null);
      const data = await loginUser(emailOrPhone, password);
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.message || 'Login failed';
      setError(msg);
      // Attach metadata to error so Login component can inspect isNewUser / status
      const customError = new Error(msg);
      customError.response = err.response;
      customError.isNewUser = Boolean(errData?.isNewUser || err.response?.status === 404);
      customError.statusCode = err.response?.status;
      throw customError;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await registerUser(userData);
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    // Immediately update local state and localStorage
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));

    try {
      setError(null);
      const data = await updateProfile(userData);
      const merged = { ...updated, ...data };
      setUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn('Backend updateProfile notice, saved locally:', err);
      return updated;
    }
  };

  const updateAvatar = (avatarUrl) => {
    const updated = { ...user, avatarUrl, avatar_url: avatarUrl };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        register,
        updateUser,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
