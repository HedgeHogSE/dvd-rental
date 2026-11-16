import { useState, useEffect } from 'react';
import api from '../../services/api';

const RentalListAll = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRentals(page);
  }, [page]);

  const fetchRentals = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, per_page: 15 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/rentals', { params });
      setRentals(response.data.data); // Читаем из data.data
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки аренд');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
    setTimeout(() => fetchRentals(1), 0);
  };

  if (loading && rentals.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Все аренды</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Фильтр по статусу: </label>
        <select value={statusFilter} onChange={handleStatusFilterChange} style={{ padding: '5px' }}>
          <option value="">Все</option>
          <option value="active">Активные (на руках)</option>
          <option value="returned">Возвращенные</option>
        </select>
      </div>
      
      {rentals.length === 0 ? (
        <p>Аренды не найдены</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>DVD</th>
                  <th>Бронирование</th>
                  <th>Дата выдачи</th>
                  <th>Вернуть до</th>
                  <th>Фактический возврат</th>
                  <th>Статус</th>
                  <th>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(rental => (
                  <tr key={rental.id}>
                    <td>{rental.user?.name}</td>
                    <td>{rental.dvd?.inventory_number} - {rental.dvd?.movie?.title}</td>
                    <td>{rental.booking_id ? `#${rental.booking_id}` : '-'}</td>
                    <td>
                      {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString() + ' ' + new Date(rental.issued_at).toLocaleTimeString() : '-'}
                    </td>
                    <td>{rental.due_on ?? '—'}</td>
                    <td>
                      {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() + ' ' + new Date(rental.returned_at).toLocaleTimeString() : '-'}
                    </td>
                    <td>
                      <span style={{ 
                        color: rental.status === 'active' ? 'var(--success)' : 'blue',
                        fontWeight: 'bold'
                      }}>
                        {rental.status === 'active' ? 'Активна' : 'Возвращена'}
                      </span>
                    </td>
                    <td>{rental.price} ₽</td>
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

export default RentalListAll;
