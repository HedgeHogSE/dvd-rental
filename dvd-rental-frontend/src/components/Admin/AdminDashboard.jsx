import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalDVDs: 0,
    activeRentals: 0,
    activeBlocks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Делаем запросы с параметром per_page=1, чтобы получить только total из мета-данных
      const [usersRes, moviesRes, dvdsRes, rentalsRes, blocksRes] = await Promise.all([
        api.get('/users', { params: { per_page: 1 } }),
        api.get('/movies', { params: { per_page: 1 } }),
        api.get('/dvds', { params: { per_page: 1 } }),
        api.get('/rentals', { params: { per_page: 1 } }),
        api.get('/blocks', { params: { per_page: 1 } })
      ]);

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalMovies: moviesRes.data.total || 0,
        totalDVDs: dvdsRes.data.total || 0,
        // Внимание: на бэкенде мы фильтруем активные аренды на клиенте.
        // Показываем общее число, пока не сделаем эндпоинт /dashboard.
        activeRentals: rentalsRes.data.total || 0, 
        activeBlocks: blocksRes.data.total || 0
      });
    } catch (error) {
      setError('Ошибка загрузки статистики');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Панель администратора</h1>
      
      <dl className="dashboard-stats">
        <div><dt>Пользователи</dt><dd>{stats.totalUsers}</dd></div>
        <div><dt>Фильмы</dt><dd>{stats.totalMovies}</dd></div>
        <div><dt>DVD</dt><dd>{stats.totalDVDs}</dd></div>
        <div><dt>Аренды</dt><dd>{stats.activeRentals}</dd></div>
        <div><dt>Блокировки</dt><dd>{stats.activeBlocks}</dd></div>
      </dl>
    </div>
  );
};

export default AdminDashboard;
