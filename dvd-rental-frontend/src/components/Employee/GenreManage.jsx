import { useState, useEffect } from 'react';
import api from '../../services/api';

const GenreManage = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data);
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить жанр?')) return;
    try {
      await api.delete(`/genres/${id}`);
      setGenres(genres.filter(g => g.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setName(genre.name);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGenre) {
        await api.put(`/genres/${editingGenre.id}`, { name });
      } else {
        await api.post('/genres', { name });
      }
      setShowForm(false);
      setEditingGenre(null);
      setName('');
      fetchGenres();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Управление жанрами</h1>
      
      <button onClick={() => { setShowForm(true); setEditingGenre(null); }} style={{ marginBottom: '24px', padding: '12px 20px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
        + Добавить жанр
      </button>

      {showForm && (
        <div style={{ background: 'var(--card-bg)', padding: '32px', marginBottom: '32px', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
          <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: '600' }}>{editingGenre ? 'Редактировать жанр' : 'Добавить жанр'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Название:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', marginTop: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
            </div>
            <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
              {editingGenre ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '12px 24px', background: 'var(--secondary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {genres.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>Жанры не найдены</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background-color)' }}>
              <tr>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Название</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {genres.map(genre => (
                <tr key={genre.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{genre.name}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <button onClick={() => handleEdit(genre)} style={{ marginRight: '5px', padding: '8px 14px', background: 'var(--warning-color)', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
                      Ред.
                    </button>
                    <button onClick={() => handleDelete(genre.id)} style={{ padding: '8px 14px', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
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

export default GenreManage;