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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Управление DVD</h1>
      
      <button onClick={() => { setShowForm(true); setEditingDvd(null); }} style={{ marginBottom: '24px', padding: '12px 20px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
        + Добавить DVD
      </button>

      {showForm && (
        <div style={{ background: 'var(--card-bg)', padding: '32px', marginBottom: '32px', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
          <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: '600' }}>{editingDvd ? 'Редактировать DVD' : 'Добавить DVD'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Фильм:</label>
              <select
                value={formData.movie_id}
                onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
              >
                <option value="">Выберите фильм</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>{movie.title}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Инвентарный номер:</label>
              <input
                type="text"
                value={formData.inventory_number}
                onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Статус:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
              >
                <option value="available">Доступен</option>
                <option value="rented">В аренде</option>
                <option value="reserved">Забронирован</option>
                <option value="unavailable">Недоступен</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Цена за день:</label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
            </div>
            <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
              {editingDvd ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '12px 24px', background: 'var(--secondary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {dvds.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>DVD не найдены</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background-color)' }}>
              <tr>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Инв. номер</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Фильм</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Цена/день</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {dvds.map(dvd => (
                <tr key={dvd.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{dvd.inventory_number}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{dvd.movie?.title || '-'}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      background: dvd.status === 'available' ? 'rgba(40, 167, 69, 0.1)' : 
                                 dvd.status === 'rented' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                      color: dvd.status === 'available' ? 'var(--success-color)' : 
                               dvd.status === 'rented' ? 'var(--danger-color)' : 'var(--warning-color)',
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '13px', border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      {dvd.status === 'available' ? 'Доступен' : 
                       dvd.status === 'rented' ? 'В аренде' : 
                       dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{dvd.price_per_day} ₽</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <button onClick={() => handleEdit(dvd)} style={{ marginRight: '5px', padding: '8px 14px', background: 'var(--warning-color)', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
                      Ред.
                    </button>
                    <button onClick={() => handleDelete(dvd.id)} style={{ padding: '8px 14px', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
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