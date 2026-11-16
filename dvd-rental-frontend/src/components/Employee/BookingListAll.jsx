import { useState, useEffect } from 'react';
import api from '../../services/api';

const BookingListAll = () => {
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
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const fetchBookings = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, per_page: 15 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/bookings', { params });
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

<<<<<<< HEAD
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
=======
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
    // Небольшая задержка, чтобы state обновился перед запросом
    setTimeout(() => fetchBookings(1), 0);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      // Обновляем локально, чтобы не делать лишний запрос
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при обновлении статуса');
    }
  };

  if (loading && bookings.length === 0) return <div>Загрузка...</div>;
>>>>>>> feature/functionality
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Все бронирования</h1>
<<<<<<< HEAD
=======

      <div style={{ marginBottom: '20px' }}>
        <label>Фильтр по статусу: </label>
        <select value={statusFilter} onChange={handleStatusFilterChange} style={{ padding: '5px' }}>
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="cancelled">Отмененные</option>
          <option value="completed">Завершенные</option>
        </select>
      </div>
>>>>>>> feature/functionality
      
      {bookings.length === 0 ? (
        <p>Бронирования не найдены</p>
      ) : (
<<<<<<< HEAD
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
=======
        <>
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

export default BookingListAll;