import { useState, useEffect } from 'react';
import api from '../../services/api';

const DVDManage = () => {
  const [dvds, setDvds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDvd, setEditingDvd] = useState(null);
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie_id: '',
    inventory_number: '',
    status: 'available',
    price_per_day: 0
  });

  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchDVDs(page);
  }, [page]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchDVDs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/dvds', { params: { page: currentPage, per_page: 15 } });
      setDvds(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки DVD');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies', { params: { per_page: 100 } });
      setMovies(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить DVD?')) return;
    try {
      await api.delete(`/dvds/${id}`);
      setDvds(dvds.filter(d => d.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleEdit = (dvd) => {
    setEditingDvd(dvd);
    setFormData({
      movie_id: dvd.movie_id.toString(),
      inventory_number: dvd.inventory_number,
      status: dvd.status,
      price_per_day: parseFloat(dvd.price_per_day)
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDvd) {
        await api.put(`/dvds/${editingDvd.id}`, formData);
      } else {
        await api.post('/dvds', formData);
      }
      setShowForm(false);
      setEditingDvd(null);
      setFormData({ movie_id: '', inventory_number: '', status: 'available', price_per_day: 0 });
      fetchDVDs(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  if (loading && dvds.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Управление DVD</h1>
      
      <button onClick={() => { setShowForm(true); setEditingDvd(null); }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить DVD
      </button>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{editingDvd ? 'Редактировать DVD' : 'Добавить DVD'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Фильм:</label>
              <select
                value={formData.movie_id}
                onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Выберите фильм</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>{movie.title}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Инвентарный номер:</label>
              <input
                type="text"
                value={formData.inventory_number}
                onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Статус:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="available">Доступен</option>
                <option value="rented">В аренде</option>
                <option value="reserved">Забронирован</option>
                <option value="unavailable">Недоступен</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Цена за день:</label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingDvd ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

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
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Цена/день</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {dvds.map(dvd => (
                  <tr key={dvd.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.inventory_number}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.title || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.status}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.price_per_day} ₽</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEdit(dvd)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                        Ред.
                      </button>
                      <button onClick={() => handleDelete(dvd.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
              <span>{meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Вперёд</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DVDManage;