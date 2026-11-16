import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (genreFilter) params.genre_id = genreFilter;
      
      const response = await api.get('/movies', { params });
      setMovies(response.data);
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data);
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleGenreFilter = (e) => {
    setGenreFilter(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Каталог фильмов</h1>
      
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '240px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Поиск по названию:</label>
          <input
            type="text"
            placeholder="Введите название..."
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Жанр:</label>
          <select value={genreFilter} onChange={handleGenreFilter} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', background: 'var(--card-bg)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '120px' }}>
          <button type="submit" style={{ width: '100%', padding: '10px 16px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>Найти</button>
        </div>
      </form>

      {movies.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>Фильмы не найдены</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px var(--shadow-color)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{movie.title}</h3>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Жанр</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{movie.genre?.name || 'Неизвестно'}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Год</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{movie.release_year}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Длительность</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{movie.duration} мин</span>
              </div>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{movie.description?.substring(0, 100)}...</p>
              <Link to={`/movies/${movie.id}`} style={{ display: 'block', padding: '10px 16px', background: 'var(--primary-color)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: '500', textAlign: 'center', transition: 'background 0.2s' }}>
                Подробнее
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;