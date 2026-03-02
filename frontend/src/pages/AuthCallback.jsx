import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      const user = await authService.getCurrentUser();


      if (!user) {
        navigate('/login');
        return;
      }

      // Role-based redirect
      if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard');
      }
    };

    finishLogin();
  }, []);

  return <p>Signing you in with GitHub…</p>;
};
