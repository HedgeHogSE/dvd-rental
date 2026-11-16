import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Параметры поиска
  const [filters, setFilters] = useState({
    search: '',
    genre_id: '',
    year_from: '',
    year_to: '',
    rating_min: '',
    available: false,
    sort: 'created_at',
    order: 'desc',
  });

  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres', { params: { per_page: 100 } });
      setGenres(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error);
    }
  };

  const fetchMovies = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, per_page: 12 };
      
      // Добавляем только те параметры, которые заполнены
      if (filters.search) params.search = filters.search;
      if (filters.genre_id) params.genre_id = filters.genre_id;
      if (filters.year_from) params.year_from = filters.year_from;
      if (filters.year_to) params.year_to = filters.year_to;
      if (filters.rating_min) params.rating_min = filters.rating_min;
      if (filters.available) params.available = true;
      if (filters.sort) params.sort = filters.sort;
      if (filters.order) params.order = filters.order;

      const response = await api.get('/movies', { params });
      setMovies(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Не удалось загрузить фильмы. Попробуйте позже.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '', genre_id: '', year_from: '', year_to: '',
      rating_min: '', available: false, sort: 'created_at', order: 'desc'
    });
    setPage(1);
    setTimeout(() => fetchMovies(1), 0);
  };

  if (loading && movies.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Каталог фильмов</h1>
      
      {/* Форма расширенного поиска */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ padding: '8px', flex: '2', minWidth: '200px' }}
          />
          <select 
            value={filters.genre_id} 
            onChange={(e) => handleFilterChange('genre_id', e.target.value)} 
            style={{ padding: '8px', flex: '1' }}
          >
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>Год от: 
            <input type="number" placeholder="1980" value={filters.year_from} onChange={(e) => handleFilterChange('year_from', e.target.value)} style={{ padding: '5px', width: '80px', marginLeft: '5px' }} />
          </label>
          <label>до: 
            <input type="number" placeholder="2024" value={filters.year_to} onChange={(e) => handleFilterChange('year_to', e.target.value)} style={{ padding: '5px', width: '80px', marginLeft: '5px' }} />
          </label>
          
          <label>Рейтинг от: 
            <input type="number" step="0.1" placeholder="7.0" value={filters.rating_min} onChange={(e) => handleFilterChange('rating_min', e.target.value)} style={{ padding: '5px', width: '60px', marginLeft: '5px' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.available} onChange={(e) => handleFilterChange('available', e.target.checked)} />
            Только доступные
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>Сортировка:
            <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} style={{ padding: '5px', marginLeft: '5px' }}>
              <option value="created_at">По дате добавления</option>
              <option value="title">По названию</option>
              <option value="release_year">По году</option>
              <option value="reviews_avg_rating">По рейтингу</option>
            </select>
          </label>
          <select value={filters.order} onChange={(e) => handleFilterChange('order', e.target.value)} style={{ padding: '5px' }}>
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </select>

          <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Найти</button>
          <button type="button" onClick={resetFilters} style={{ padding: '8px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Сбросить</button>
        </div>
      </form>

      {movies.length === 0 ? (
        <p>Фильмы не найдены</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {movies.map(movie => (
              <div key={movie.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3>{movie.title}</h3>
                <p><strong>Жанр:</strong> {movie.genre?.name || 'Неизвестно'}</p>
                <p><strong>Год:</strong> {movie.release_year}</p>
                <p><strong>Рейтинг:</strong> {movie.reviews_avg_rating ? `${Number(movie.reviews_avg_rating).toFixed(1)} / 10` : 'Нет оценок'}</p>
                <p><strong>Длительность:</strong> {movie.duration} мин</p>
                <p>{movie.description?.substring(0, 100)}...</p>
                <Link to={`/movies/${movie.id}`} style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                  Подробнее
                </Link>
              </div>
            ))}
          </div>

          {/* Блок пагинации */}
          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
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

export default MovieList;