import { useState, useEffect } from 'react';
import api from '../../services/api';

const DVDManage = () => {
  const [dvds, setDvds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDvd, setEditingDvd] = useState(null);
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie_id: '',
    inventory_number: '',
    status: 'available',
    price_per_day: 0
  });

  useEffect(() => {
    fetchDVDs();
    fetchMovies();
  }, []);

  const fetchDVDs = async () => {
    try {
      const response = await api.get('/dvds');
      setDvds(response.data);
    } catch (error) {
      console.error('Ошибка загрузки DVD:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
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
      console.error('Ошибка удаления:', error);
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
      fetchDVDs();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;

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
      )}
    </div>
  );
};

export default DVDManage;