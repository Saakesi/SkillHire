import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 On app load → ask backend "who am I?"
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
