import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const fetchBookings = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bookings', { params: { page: currentPage, per_page: 15 } });
      setBookings(response.data.data); // Читаем из data.data
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки бронирований');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Отменить бронирование?')) return;
    
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      // Обновляем локально, чтобы не делать лишний запрос
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при отмене бронирования');
    }
  };

  if (loading && bookings.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Мои бронирования</h1>
      
      {bookings.length === 0 ? (
        <p>У вас нет бронирований</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Link 
              to="/bookings/new" 
              style={{ padding: '10px 20px', background: 'var(--success)', color: 'var(--surface)', textDecoration: 'none', borderRadius: '4px' }}
            >
              + Создать бронирование
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DVD</th>
                  <th>Фильм</th>
                  <th>Период</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.dvd?.inventory_number}</td>
                    <td>{booking.dvd?.movie?.title}</td>
                    <td>
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{ 
                        color: booking.status === 'active' ? 'var(--success)' :
                               booking.status === 'cancelled' ? 'var(--danger)' : 'blue',
                        fontWeight: 'bold'
                      }}>
                        {booking.status === 'active' ? 'Активное' : 
                         booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'active' && (
                        <button 
                          onClick={() => cancelBooking(booking.id)} 
                          style={{ padding: '5px 10px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}
                        >
                          Отменить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {meta && meta.last_page > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '5px 15px' }}>Назад</button>
              <span>Страница {meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} style={{ padding: '5px 15px' }}>Вперёд</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;