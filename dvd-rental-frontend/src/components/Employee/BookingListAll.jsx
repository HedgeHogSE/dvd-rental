import { useState, useEffect } from 'react';
import api from '../../services/api';

const BookingListAll = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    } catch (error) {
      setError('Ошибка загрузки бронирований');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Все бронирования</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Фильтр по статусу: </label>
        <select value={statusFilter} onChange={handleStatusFilterChange} style={{ padding: '5px' }}>
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="cancelled">Отмененные</option>
          <option value="completed">Завершенные</option>
        </select>
      </div>
      
      {bookings.length === 0 ? (
        <p>Бронирования не найдены</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>DVD</th>
                  <th>Период</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.user?.name}</td>
                    <td>{booking.dvd?.inventory_number} - {booking.dvd?.movie?.title}</td>
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
                          onClick={() => updateStatus(booking.id, 'cancelled')} 
                          style={{ marginRight: '5px', padding: '5px 10px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}
                        >
                          Отменить
                        </button>
                      )}
                      {booking.status === 'active' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'completed')} 
                          style={{ padding: '5px 10px', background: 'var(--success)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}
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

export default BookingListAll;