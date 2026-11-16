import { createContext, useContext, useEffect, useState } from 'react';
import api from '../../services/api';

const AuthSession = createContext(null);

export const useAuthSession = () => useContext(AuthSession);

export const AuthSessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user || !token) return;

    const controller = new AbortController();
    const isCurrent = () => !controller.signal.aborted && localStorage.getItem('token') === token;

    api.get('/user', { signal: controller.signal })
      .then(({ data }) => {
        if (!isCurrent()) return;
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isCurrent()) return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [user]);

  const signIn = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.removeItem('user');
    setUser(user);
    setError(false);
    setLoading(false);
  };

  const signOut = async () => {
    try {
      await api.post('/logout');
    } catch {
      // End the local session even if the API is unavailable.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(false);
      setLoading(false);
    }
  };

  const roles = user?.roles?.map(role => role.name) ?? [];
  const isAdmin = roles.includes('admin');
  const isStaff = isAdmin || roles.includes('employee');

  return (
    <AuthSession.Provider value={{ user, loading, error, isAdmin, isStaff, signIn, signOut }}>
      {children}
    </AuthSession.Provider>
  );
};
