import { useState, useEffect } from 'react';
import api from '../../services/api';

const BookingListAll = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      setError('Ошибка загрузки бронирований');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (error) {
      setError('Ошибка при обновлении статуса');
      console.error(error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger-color)', padding: '24px', background: '#f8d7da', borderRadius: '4px' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Все бронирования</h1>
      
      {bookings.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>Бронирования не найдены</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background-color)' }}>
              <tr>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Пользователь</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>DVD</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Период</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{booking.user?.name}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{booking.dvd?.inventory_number} - {booking.dvd?.movie?.title}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {new Date(booking.start_date).toLocaleDateString('ru-RU')} - {new Date(booking.end_date).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      background: booking.status === 'active' ? 'rgba(40, 167, 69, 0.1)' : 
                                 booking.status === 'cancelled' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(23, 162, 184, 0.1)',
                      color: booking.status === 'active' ? 'var(--success-color)' : 
                               booking.status === 'cancelled' ? 'var(--danger-color)' : 'var(--info-color)',
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '13px', border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      {booking.status === 'active' ? 'Активное' : 
                       booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    {booking.status === 'active' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')} 
                        style={{ marginRight: '5px', padding: '8px 14px', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
                      >
                        Отменить
                      </button>
                    )}
                    {booking.status === 'active' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'completed')} 
                        style={{ padding: '8px 14px', background: 'var(--success-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
                      >
                        Завершить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingListAll;