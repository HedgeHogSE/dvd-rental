import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return null;

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const roles = user.roles?.map(r => r.name) || [];
  const isAdmin = roles.includes('admin');
  const isEmployee = roles.includes('employee');
  const isStaff = isAdmin || isEmployee;
  const isClient = roles.includes('client');

  return (
    <nav style={{ background: '#333', padding: '15px', color: '#fff', marginBottom: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Основные ссылки (доступны всем авторизованным) */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link to="/movies" style={{ color: '#fff', textDecoration: 'none' }}>Фильмы</Link>
          <Link to="/dvds" style={{ color: '#fff', textDecoration: 'none' }}>DVD</Link>
          <Link to="/wishlist" style={{ color: '#fff', textDecoration: 'none' }}>Избранное</Link>
          <Link to="/bookings" style={{ color: '#fff', textDecoration: 'none' }}>Мои брони</Link>
          <Link to="/rentals" style={{ color: '#fff', textDecoration: 'none' }}>Мои аренды</Link>
        </div>

        {/* Ссылки сотрудника */}
        {isStaff && (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#444', padding: '5px 10px', borderRadius: '5px' }}>
            <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Сотрудник:</span>
            <Link to="/employee/movies" style={{ color: '#fff', textDecoration: 'none' }}>Фильмы</Link>
            <Link to="/employee/genres" style={{ color: '#fff', textDecoration: 'none' }}>Жанры</Link>
            <Link to="/employee/dvds" style={{ color: '#fff', textDecoration: 'none' }}>DVD</Link>
            <Link to="/employee/bookings" style={{ color: '#fff', textDecoration: 'none' }}>Брони</Link>
            <Link to="/employee/rentals" style={{ color: '#fff', textDecoration: 'none' }}>Аренда</Link>
            <Link to="/employee/issue" style={{ color: '#fff', textDecoration: 'none' }}>Выдача</Link>
            <Link to="/employee/return" style={{ color: '#fff', textDecoration: 'none' }}>Возврат</Link>
          </div>
        )}

        {/* Ссылки админа */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#555', padding: '5px 10px', borderRadius: '5px' }}>
            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Админ:</span>
            <Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Панель</Link>
            <Link to="/admin/users" style={{ color: '#fff', textDecoration: 'none' }}>Пользователи</Link>
            <Link to="/admin/roles" style={{ color: '#fff', textDecoration: 'none' }}>Роли</Link>
            <Link to="/admin/blocks" style={{ color: '#fff', textDecoration: 'none' }}>Блокировки</Link>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <NotificationBell />
          <span>Привет, {user.name || 'Гость'}!</span>
          <button onClick={handleLogout} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Выход
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navigation;