import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navigation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!token) {
    return null;
  }

  const isAdmin = user.roles?.some((role) => role.name === 'admin');
  const isEmployee = user.roles?.some((role) => role.name === 'employee');
  const isClient = user.roles?.some((role) => role.name === 'client');

  const linkStyle = { color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', transition: 'background 0.2s, color 0.2s' };
  const linkHover = { color: 'var(--primary-color)', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', transition: 'background 0.2s, color 0.2s' };
  const primaryLink = { color: 'var(--primary-color)', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', transition: 'background 0.2s, color 0.2s' };

  return (
    <nav style={{ background: '#ffffff', padding: '12px 0', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '18px' }}>DVD Prokat</Link>
          <Link to="/movies" style={linkStyle}>Фильмы</Link>
          <Link to="/dvds" style={linkStyle}>DVD</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isEmployee && (
            <>
              <Link to="/employee/movies" style={linkStyle}>Фильмы</Link>
              <Link to="/employee/genres" style={linkStyle}>Жанры</Link>
              <Link to="/employee/dvds" style={linkStyle}>DVD</Link>
              <Link to="/employee/bookings" style={linkStyle}>Брони</Link>
              <Link to="/employee/rentals" style={linkStyle}>Аренда</Link>
              <Link to="/employee/issue" style={linkStyle}>Выдача</Link>
              <Link to="/employee/return" style={linkStyle}>Возврат</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" style={linkStyle}>Панель</Link>
              <Link to="/admin/users" style={linkStyle}>Пользователи</Link>
              <Link to="/admin/roles" style={linkStyle}>Роли</Link>
              <Link to="/admin/blocks" style={linkStyle}>Блокировки</Link>
            </>
          )}
          {isClient && (
            <>
              <Link to="/bookings" style={linkStyle}>Бронирования</Link>
              <Link to="/bookings/new" style={primaryLink}>Новое</Link>
              <Link to="/rentals" style={linkStyle}>Аренды</Link>
            </>
          )}
          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{user.name}</span>
          <button onClick={handleLogout} style={{ background: 'var(--danger-color)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
            Выход
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;