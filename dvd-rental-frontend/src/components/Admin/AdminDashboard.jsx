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
      background: 'var(--card-bg)',
      padding: '24px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px var(--shadow-color)',
      textAlign: 'center'
    }}>
      <h3 style={{ color: color, margin: '0 0 12px 0', fontWeight: '500', fontSize: '14px', textTransform: 'uppercase' }}>{title}</h3>
      <p style={{ fontSize: '36px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Панель администратора</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Всего пользователей" value={stats.totalUsers} color="var(--primary-color)" />
        <StatCard title="Всего фильмов" value={stats.totalMovies} color="var(--success-color)" />
        <StatCard title="Всего DVD" value={stats.totalDVDs} color="var(--info-color)" />
        <StatCard title="Активных аренд" value={stats.activeRentals} color="var(--warning-color)" />
        <StatCard title="Активных блокировок" value={stats.activeBlocks} color="var(--danger-color)" />
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>Общая информация</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Система видеопроката DVD-дисков функционирует в штатном режиме.</p>
        <p style={{ color: 'var(--text-secondary)' }}>Администратор может управлять пользователями, ролями и блокировками через соответствующие разделы.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;