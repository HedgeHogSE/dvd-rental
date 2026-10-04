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
      <h1>Каталог фильмов</h1>
      
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={handleSearch}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />
        <select value={genreFilter} onChange={handleGenreFilter} style={{ padding: '8px' }}>
          <option value="">Все жанры</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: '8px 15px' }}>Найти</button>
      </form>

      {movies.length === 0 ? (
        <p>Фильмы не найдены</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3>{movie.title}</h3>
              <p><strong>Жанр:</strong> {movie.genre?.name || 'Неизвестно'}</p>
              <p><strong>Год:</strong> {movie.release_year}</p>
              <p><strong>Длительность:</strong> {movie.duration} мин</p>
              <p>{movie.description?.substring(0, 100)}...</p>
              <Link to={`/movies/${movie.id}`} style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
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