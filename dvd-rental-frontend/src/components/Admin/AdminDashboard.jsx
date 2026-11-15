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

  const StatCard = ({ title, value, color }) => (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h3 style={{ color: color, margin: '0 0 10px 0' }}>{title}</h3>
      <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{value}</p>
    </div>
  );

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Панель администратора</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Всего пользователей" value={stats.totalUsers} color="#007bff" />
        <StatCard title="Всего фильмов" value={stats.totalMovies} color="#28a745" />
        <StatCard title="Всего DVD" value={stats.totalDVDs} color="#17a2b8" />
        <StatCard title="Активных аренд" value={stats.activeRentals} color="#ffc107" />
        <StatCard title="Активных блокировок" value={stats.activeBlocks} color="#dc3545" />
      </div>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h2>Общая информация</h2>
        <p>Система видеопроката DVD-дисков функционирует в штатном режиме.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;