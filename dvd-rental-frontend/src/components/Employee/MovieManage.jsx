import { useState, useEffect } from 'react';
import api from '../../services/api';

const emptyMovie = {
  title: '',
  description: '',
  release_year: new Date().getFullYear(),
  duration: 0,
  genre_ids: [],
};

const MovieManage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState(emptyMovie);
  const [genres, setGenres] = useState([]);
  const [genresLoadError, setGenresLoadError] = useState('');
  const [genreError, setGenreError] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres', { params: { per_page: 100 } });
      const pages = Array.from({ length: response.data.last_page - 1 }, (_, index) => index + 2);
      const additionalPages = await Promise.all(
        pages.map(page => api.get('/genres', { params: { page, per_page: 100 } }))
      );
      setGenres([...response.data.data, ...additionalPages.flatMap(result => result.data.data)]);
    } catch (error) {
      setGenresLoadError('Не удалось загрузить жанры.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить фильм?')) return;
    try {
      await api.delete(`/movies/${id}`);
      setMovies(movies.filter(m => m.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleEdit = (movie) => {
    setGenreError('');
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      release_year: movie.release_year,
      duration: movie.duration,
      genre_ids: movie.genres.map(genre => genre.id),
    });
    setShowForm(true);
  };

  const toggleGenre = (id) => {
    setGenreError('');
    setFormData(current => ({
      ...current,
      genre_ids: current.genre_ids.includes(id)
        ? current.genre_ids.filter(genreId => genreId !== id)
        : [...current.genre_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.genre_ids.length === 0) {
      setGenreError('Выберите хотя бы один жанр.');
      return;
    }
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, formData);
      } else {
        await api.post('/movies', formData);
      }
      setShowForm(false);
      setEditingMovie(null);
      setFormData(emptyMovie);
      fetchMovies(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  if (loading && movies.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Управление фильмами</h1>
      
      <button onClick={() => {
        setFormData(emptyMovie);
        setGenreError('');
        setEditingMovie(null);
        setShowForm(true);
      }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить фильм
      </button>

      {showForm && (
        <div style={{ background: 'var(--wash)', padding: '20px', marginBottom: '20px', borderRadius: '3px' }}>
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
            <fieldset className="movie-genres">
              <legend>Жанры</legend>
              {genresLoadError ? (
                <p className="error-message" role="alert">{genresLoadError}</p>
              ) : genres.length > 0 ? (
                <div className="movie-genre-options">
                  {genres.map(genre => (
                    <label key={genre.id} className="check-label">
                      <input
                        type="checkbox"
                        checked={formData.genre_ids.includes(genre.id)}
                        onChange={() => toggleGenre(genre.id)}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
              ) : <p>Жанры пока недоступны.</p>}
              {genreError && <p className="error-message" role="alert">{genreError}</p>}
            </fieldset>
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              {editingMovie ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: 'var(--muted)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {movies.length === 0 ? (
        <p>Фильмы не найдены</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Жанры</th>
                  <th>Год</th>
                  <th>Длительность</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {movies.map(movie => (
                  <tr key={movie.id}>
                    <td>{movie.title}</td>
                    <td>{movie.genres.map(genre => genre.name).join(', ') || '—'}</td>
                    <td>{movie.release_year}</td>
                    <td>{movie.duration} мин</td>
                    <td>
                      <button onClick={() => handleEdit(movie)} style={{ marginRight: '5px', padding: '5px 10px', background: 'var(--warning-bg)', border: 'none', cursor: 'pointer' }}>
                        Ред.
                      </button>
                      <button onClick={() => handleDelete(movie.id)} style={{ padding: '5px 10px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div className="pagination">
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

export default MovieManage;
