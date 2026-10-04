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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, moviesRes, dvdsRes, rentalsRes, blocksRes] = await Promise.all([
        api.get('/users'),
        api.get('/movies'),
        api.get('/dvds'),
        api.get('/rentals'),
        api.get('/blocks')
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        totalMovies: moviesRes.data.length,
        totalDVDs: dvdsRes.data.length,
        activeRentals: rentalsRes.data.filter(r => r.status === 'active').length,
        activeBlocks: blocksRes.data.length
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
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
        <p>Администратор может управлять пользователями, ролями и блокировками через соответствующие разделы.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;