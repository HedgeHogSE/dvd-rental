import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
  if (requiredRole && !user.roles?.some((role) => role.name === requiredRole)) {
=======
  const userRoles = user.roles?.map(r => r.name) || [];

  if (!requiredRole) {
    return children;
  }

  if (requiredRole === 'employee') {
    if (!userRoles.includes('admin') && !userRoles.includes('employee')) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  if (!userRoles.includes(requiredRole)) {
>>>>>>> feature/functionality
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;