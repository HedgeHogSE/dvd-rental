import { useState, useEffect } from 'react';
import api from '../../services/api';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom';
>>>>>>> feature/functionality

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< HEAD

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
=======
  
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
>>>>>>> feature/functionality
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
<<<<<<< HEAD
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (error) {
      setError('Ошибка при отмене бронирования');
      console.error(error);
    }
  };

  if (loading) return <div>Загрузка...</div>;
=======
      // Обновляем локально, чтобы не делать лишний запрос
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при отмене бронирования');
    }
  };

  if (loading && bookings.length === 0) return <div>Загрузка...</div>;
>>>>>>> feature/functionality
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Мои бронирования</h1>
      
      {bookings.length === 0 ? (
        <p>У вас нет бронирований</p>
      ) : (
<<<<<<< HEAD
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Период</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.dvd?.inventory_number}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.dvd?.movie?.title}</td>
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
                        onClick={() => cancelBooking(booking.id)} 
                        style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
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
=======
        <>
          <div style={{ marginBottom: '20px' }}>
            <Link 
              to="/bookings/new" 
              style={{ padding: '10px 20px', background: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
            >
              + Создать бронирование
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Период</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.dvd?.inventory_number}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.dvd?.movie?.title}</td>
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
                          onClick={() => cancelBooking(booking.id)} 
                          style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
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
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '5px 15px' }}>Назад</button>
              <span>Страница {meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} style={{ padding: '5px 15px' }}>Вперёд</button>
            </div>
          )}
        </>
>>>>>>> feature/functionality
      )}
    </div>
  );
};

export default MyBookings;