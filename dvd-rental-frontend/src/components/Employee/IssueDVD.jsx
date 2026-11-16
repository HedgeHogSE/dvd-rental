import { useState, useEffect } from 'react';
import api from '../../services/api';

const IssueDVD = () => {
  const [users, setUsers] = useState([]);
  const [dvds, setDvds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    dvd_id: '',
    booking_id: '',
    days: 1
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchAvailableDVDs();
    fetchBookings();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const fetchAvailableDVDs = async () => {
    try {
      const response = await api.get('/dvds');
      setDvds(response.data.filter(dvd => ['available', 'reserved'].includes(dvd.status)));
    } catch (error) {
      console.error('Ошибка загрузки DVD:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.filter(b => b.status === 'active'));
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/rentals', {
        user_id: formData.user_id,
        dvd_id: formData.dvd_id,
        booking_id: formData.booking_id || null,
        days: formData.days
      });
      setSuccess(true);
      setTimeout(() => {
        setFormData({ user_id: '', dvd_id: '', booking_id: '', days: 1 });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при выдаче DVD');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '48px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--success-color)', marginBottom: '16px' }}>DVD успешно выдан!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Форма сброшена.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Выдача DVD</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '520px', margin: '0 auto', padding: '32px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Пользователь:</label>
          <select
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          >
            <option value="">Выберите пользователя</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>DVD:</label>
          <select
            value={formData.dvd_id}
            onChange={(e) => setFormData({ ...formData, dvd_id: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          >
            <option value="">Выберите DVD</option>
            {dvds.map(dvd => (
              <option key={dvd.id} value={dvd.id}>
                {dvd.inventory_number} - {dvd.movie?.title} - {dvd.price_per_day} ₽/день
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Бронирование (опционально):</label>
          <select
            value={formData.booking_id}
            onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          >
            <option value="">Без бронирования</option>
            {bookings.map(booking => (
              <option key={booking.id} value={booking.id}>
                #{booking.id} - {booking.dvd?.movie?.title} ({new Date(booking.start_date).toLocaleDateString('ru-RU')} - {new Date(booking.end_date).toLocaleDateString('ru-RU')})
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Количество дней:</label>
          <input
            type="number"
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
            required
            min="1"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          />
        </div>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Выдача...' : 'Выдать DVD'}
        </button>
      </form>
    </div>
  );
};

export default IssueDVD;