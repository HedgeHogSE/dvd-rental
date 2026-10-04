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

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Все бронирования</h1>
      
      {bookings.length === 0 ? (
        <p>Бронирования не найдены</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Период</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.user?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.dvd?.inventory_number} - {booking.dvd?.movie?.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ 
                      color: booking.status === 'active' ? 'green' : 
                             booking.status === 'cancelled' ? 'red' : 'blue',
                      fontWeight: 'bold'
                    }}>
                      {booking.status === 'active' ? 'Активное' : 
                       booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {booking.status === 'active' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')} 
                        style={{ marginRight: '5px', padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Отменить
                      </button>
                    )}
                    {booking.status === 'active' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'completed')} 
                        style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
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