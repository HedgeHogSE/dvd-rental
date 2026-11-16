import { useState, useEffect } from 'react';
import api from '../../services/api';

const GenreManage = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [name, setName] = useState('');

  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchGenres(page);
  }, [page]);

  const fetchGenres = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/genres', { params: { page: currentPage, per_page: 15 } });
      setGenres(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки жанров');
      console.error(error);
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
      alert(error.response?.data?.message || 'Ошибка удаления');
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
      fetchGenres(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  if (loading && genres.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Управление жанрами</h1>
      
      <button onClick={() => { setShowForm(true); setEditingGenre(null); }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить жанр
      </button>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{editingGenre ? 'Редактировать жанр' : 'Добавить жанр'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Название:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingGenre ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {genres.length === 0 ? (
        <p>Жанры не найдены</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Название</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {genres.map(genre => (
                  <tr key={genre.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{genre.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEdit(genre)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                        Ред.
                      </button>
                      <button onClick={() => handleDelete(genre.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
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

export default GenreManage;