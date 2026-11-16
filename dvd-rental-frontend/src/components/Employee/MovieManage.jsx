import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
=======
>>>>>>> feature/functionality
import api from '../../services/api';

const MovieManage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
=======
  const [error, setError] = useState('');
>>>>>>> feature/functionality
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_year: new Date().getFullYear(),
    duration: 0,
    genre_id: ''
  });
  const [genres, setGenres] = useState([]);

<<<<<<< HEAD
  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error);
=======
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchMovies = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/movies', { params: { page: currentPage, per_page: 15 } });
      setMovies(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки фильмов');
      console.error(error);
>>>>>>> feature/functionality
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
<<<<<<< HEAD
      const response = await api.get('/genres');
      setGenres(response.data);
=======
      const response = await api.get('/genres', { params: { per_page: 100 } });
      setGenres(response.data.data || []);
>>>>>>> feature/functionality
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить фильм?')) return;
    try {
      await api.delete(`/movies/${id}`);
      setMovies(movies.filter(m => m.id !== id));
    } catch (error) {
<<<<<<< HEAD
      console.error('Ошибка удаления:', error);
=======
      alert(error.response?.data?.message || 'Ошибка удаления');
>>>>>>> feature/functionality
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      release_year: movie.release_year,
      duration: movie.duration,
      genre_id: movie.genre_id.toString()
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, formData);
      } else {
        await api.post('/movies', formData);
      }
      setShowForm(false);
      setEditingMovie(null);
      setFormData({ title: '', description: '', release_year: new Date().getFullYear(), duration: 0, genre_id: '' });
<<<<<<< HEAD
      fetchMovies();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;
=======
      fetchMovies(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  if (loading && movies.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Управление фильмами</h1>
      
      <button onClick={() => { setShowForm(true); setEditingMovie(null); }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить фильм
      </button>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{editingMovie ? 'Редактировать фильм' : 'Добавить фильм'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Название:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Описание:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Год:</label>
                <input
                  type="number"
                  value={formData.release_year}
                  onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
                  required
                  min="1888"
                  max={new Date().getFullYear() + 1}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Длительность (мин):</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                  min="1"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Жанр:</label>
              <select
                value={formData.genre_id}
                onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Выберите жанр</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingMovie ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {movies.length === 0 ? (
        <p>Фильмы не найдены</p>
      ) : (
<<<<<<< HEAD
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Название</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Жанр</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Год</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Длительность</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.genre?.name || '-'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.release_year}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.duration} мин</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => handleEdit(movie)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                      Ред.
                    </button>
                    <button onClick={() => handleDelete(movie.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Удалить
                    </button>
                  </td>
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
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Название</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Жанр</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Год</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Длительность</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {movies.map(movie => (
                  <tr key={movie.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.title}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.genre?.name || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.release_year}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{movie.duration} мин</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEdit(movie)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                        Ред.
                      </button>
                      <button onClick={() => handleDelete(movie.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
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
>>>>>>> feature/functionality
      )}
    </div>
  );
};

export default MovieManage;