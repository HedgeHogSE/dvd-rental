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

  return (
    <nav style={{ background: '#333', padding: '15px', marginBottom: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Главная</Link>
          <Link to="/movies" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Фильмы</Link>
          <Link to="/dvds" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>DVD</Link>
        </div>
        <div>
          {isEmployee && (
            <>
              <Link to="/employee/movies" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Фильмы</Link>
              <Link to="/employee/genres" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Жанры</Link>
              <Link to="/employee/dvds" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>DVD</Link>
              <Link to="/employee/bookings" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Бронирования</Link>
              <Link to="/employee/rentals" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Аренда</Link>
              <Link to="/employee/issue" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Выдача</Link>
              <Link to="/employee/return" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Возврат</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Панель</Link>
              <Link to="/admin/users" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Пользователи</Link>
              <Link to="/admin/roles" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Роли</Link>
              <Link to="/admin/blocks" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Блокировки</Link>
            </>
          )}
          {isClient && (
            <>
              <Link to="/bookings" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Мои бронирования</Link>
              <Link to="/bookings/new" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Новое бронирование</Link>
              <Link to="/rentals" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Мои аренды</Link>
            </>
          )}
          <span style={{ color: '#fff', marginRight: '20px' }}>Привет, {user.name}!</span>
          <button onClick={handleLogout} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>
            Выход
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;