import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const me = await authService.getCurrentUser();
      // console.log("/auth/me response:", me);
      setUser(me);
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGitHub = () => {
    authService.loginWithGitHub();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authService.getCurrentUser();
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user?.profile,
        role: user?.role,
        loading,
        isAuthenticated: !!user,
        loginWithGitHub,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
