import { useState, useEffect } from 'react';
import api from '../../services/api';

const RentalListAll = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< HEAD

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await api.get('/rentals');
      setRentals(response.data);
=======
  
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
>>>>>>> feature/functionality
    } catch (error) {
      setError('Ошибка загрузки аренд');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  if (loading) return <div>Загрузка...</div>;
=======
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
    setTimeout(() => fetchRentals(1), 0);
  };

  if (loading && rentals.length === 0) return <div>Загрузка...</div>;
>>>>>>> feature/functionality
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Все аренды</h1>
<<<<<<< HEAD
=======

      <div style={{ marginBottom: '20px' }}>
        <label>Фильтр по статусу: </label>
        <select value={statusFilter} onChange={handleStatusFilterChange} style={{ padding: '5px' }}>
          <option value="">Все</option>
          <option value="active">Активные (на руках)</option>
          <option value="returned">Возвращенные</option>
        </select>
      </div>
>>>>>>> feature/functionality
      
      {rentals.length === 0 ? (
        <p>Аренды не найдены</p>
      ) : (
<<<<<<< HEAD
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Бронирование</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата выдачи</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата возврата</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => (
                <tr key={rental.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.user?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.dvd?.inventory_number} - {rental.dvd?.movie?.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.booking_id ? `#${rental.booking_id}` : '-'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString() + ' ' + new Date(rental.issued_at).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() + ' ' + new Date(rental.returned_at).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ 
                      color: rental.status === 'active' ? 'green' : 'blue',
                      fontWeight: 'bold'
                    }}>
                      {rental.status === 'active' ? 'Активна' : 'Возвращена'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.price} ₽</td>
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
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Бронирование</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата выдачи</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата возврата</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(rental => (
                  <tr key={rental.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.user?.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.dvd?.inventory_number} - {rental.dvd?.movie?.title}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.booking_id ? `#${rental.booking_id}` : '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString() + ' ' + new Date(rental.issued_at).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() + ' ' + new Date(rental.returned_at).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <span style={{ 
                        color: rental.status === 'active' ? 'green' : 'blue',
                        fontWeight: 'bold'
                      }}>
                        {rental.status === 'active' ? 'Активна' : 'Возвращена'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.price} ₽</td>
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

export default RentalListAll;