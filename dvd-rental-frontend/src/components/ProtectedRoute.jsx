import { Navigate } from 'react-router-dom';
import { useAuthSession } from './Auth/AuthSession';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, error, isAdmin, isStaff } = useAuthSession();

  if (loading) return <p role="status">Загрузка профиля…</p>;
  if (error) return <p role="alert">Не удалось загрузить профиль. Обновите страницу, чтобы повторить запрос.</p>;
  if (!user) return <Navigate to="/login" replace />;

  if ((requiredRole === 'admin' && !isAdmin) || (requiredRole === 'employee' && !isStaff)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
