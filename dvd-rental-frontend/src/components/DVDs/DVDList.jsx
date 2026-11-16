import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Добавили Link
import api from '../../services/api';

const DVDList = () => {
  const [dvds, setDvds] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDVDs(1);
  };

  if (loading && dvds.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Список DVD</h1>
      
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
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Инв. номер</th>
                  <th>Фильм</th>
                  <th>Жанры</th>
                  <th>Статус</th>
                  <th>Цена/день</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {dvds.map(dvd => (
                  <tr key={dvd.id}>
                    <td>{dvd.inventory_number}</td>
                    <td>{dvd.movie?.title || 'Неизвестно'}</td>
                    <td>{dvd.movie?.genres?.map(genre => genre.name).join(', ') || 'Неизвестно'}</td>
                    <td>
                      <span style={{ 
                        color: dvd.status === 'available' ? 'var(--success)' :
                               dvd.status === 'rented' ? 'var(--danger)' : 'orange',
                        fontWeight: 'bold'
                      }}>
                        {dvd.status === 'available' ? 'Доступен' : 
                         dvd.status === 'rented' ? 'В аренде' : 
                         dvd.status === 'reserved' ? 'Есть брони' : 'Недоступен'}
                      </span>
                    </td>
                    <td>{dvd.price_per_day} ₽</td>
                    <td>
                      {dvd.status !== 'unavailable' && (
                        <Link 
                          to={`/bookings/new?dvd_id=${dvd.id}`} 
                          style={{ padding: '5px 10px', background: 'var(--accent)', color: 'var(--surface)', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}
                        >
                          Выбрать даты
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

export default DVDList;
