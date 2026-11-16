import { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom'; // Добавили Link
>>>>>>> feature/functionality
import api from '../../services/api';

const DVDList = () => {
  const [dvds, setDvds] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  useEffect(() => {
    fetchDVDs();
  }, []);

  const fetchDVDs = async () => {
    try {
      const response = await api.get('/dvds');
      setDvds(response.data);
    } catch (error) {
      console.error('Ошибка загрузки DVD:', error);
=======
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchDVDs(page);
  }, [page]);

  const fetchDVDs = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/dvds', { params });
      setDvds(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки DVD');
      console.error(error);
>>>>>>> feature/functionality
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  if (loading) return <div>Загрузка...</div>;
=======
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDVDs(1);
  };

  if (loading && dvds.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Список DVD</h1>
      
<<<<<<< HEAD
      {dvds.length === 0 ? (
        <p>DVD не найдены</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Инв. номер</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Жанр</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Цена/день</th>
              </tr>
            </thead>
            <tbody>
              {dvds.map(dvd => (
                <tr key={dvd.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.inventory_number}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.title || 'Неизвестно'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.genre?.name || 'Неизвестно'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ 
                      color: dvd.status === 'available' ? 'green' : 
                             dvd.status === 'rented' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {dvd.status === 'available' ? 'Доступен' : 
                       dvd.status === 'rented' ? 'В аренде' : 
                       dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.price_per_day} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
=======
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Поиск по инвентарному номеру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px' }}>
          <option value="">Все статусы</option>
          <option value="available">Доступен</option>
          <option value="rented">В аренде</option>
          <option value="reserved">Забронирован</option>
          <option value="unavailable">Недоступен</option>
        </select>
        <button type="submit" style={{ padding: '8px 15px' }}>Найти</button>
      </form>

      {dvds.length === 0 ? (
        <p>DVD не найдены</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Инв. номер</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Жанр</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Цена/день</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {dvds.map(dvd => (
                  <tr key={dvd.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.inventory_number}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.title || 'Неизвестно'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.genre?.name || 'Неизвестно'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <span style={{ 
                        color: dvd.status === 'available' ? 'green' : 
                               dvd.status === 'rented' ? 'red' : 'orange',
                        fontWeight: 'bold'
                      }}>
                        {dvd.status === 'available' ? 'Доступен' : 
                         dvd.status === 'rented' ? 'В аренде' : 
                         dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.price_per_day} ₽</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {dvd.status === 'available' && (
                        <Link 
                          to={`/bookings/new?dvd_id=${dvd.id}`} 
                          style={{ padding: '5px 10px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}
                        >
                          Забронировать
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

export default DVDList;