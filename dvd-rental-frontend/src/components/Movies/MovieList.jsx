import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const defaultFilters = {
  search: '',
  genre_id: '',
  year_from: '',
  year_to: '',
  rating_min: '',
  available: false,
  sort: 'created_at',
  order: 'desc',
};

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [query, setQuery] = useState({ filters: defaultFilters, page: 1 });
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/genres', { params: { per_page: 100 } })
      .then(response => setGenres(response.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const activeFilters = Object.fromEntries(
      Object.entries(query.filters).filter(([, value]) => value)
    );

    setLoading(true);
    setError('');
    api.get('/movies', {
      params: { ...activeFilters, page: query.page, per_page: 12 },
      signal: controller.signal,
    }).then(({ data }) => {
      setMovies(data.data);
      setMeta(data);
    }).catch(() => {
      if (!controller.signal.aborted) setError('Не удалось загрузить фильмы. Попробуйте позже.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [query]);

  const updateFilter = (event) => {
    const { name, type, value, checked } = event.target;
    setFilters(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitFilters = (event) => {
    event.preventDefault();
    setQuery({ filters, page: 1 });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setQuery({ filters: defaultFilters, page: 1 });
  };

  const changePage = (step) => {
    setQuery(current => ({ ...current, page: current.page + step }));
  };

  return (
    <section>
      <header className="catalog-heading">
        <h1>Каталог фильмов</h1>
        {meta && !loading && !error && <span>Найдено фильмов: {meta.total}</span>}
      </header>

      <form className="catalog-filters" onSubmit={submitFilters}>
        <div className="search-row">
          <label>
            Поиск
            <input type="search" name="search" placeholder="Название или описание" value={filters.search} onChange={updateFilter} />
          </label>
          <label>
            Жанр
            <select name="genre_id" value={filters.genre_id} onChange={updateFilter}>
              <option value="">Все жанры</option>
              {genres.map(genre => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </label>
        </div>

        <details className="advanced-filters">
          <summary>Дополнительные фильтры</summary>
          <div className="advanced-fields">
            <label>Год от <input type="number" name="year_from" value={filters.year_from} onChange={updateFilter} /></label>
            <label>Год до <input type="number" name="year_to" value={filters.year_to} onChange={updateFilter} /></label>
            <label>Рейтинг от <input type="number" name="rating_min" step="0.1" value={filters.rating_min} onChange={updateFilter} /></label>
            <label>
              Сортировка
              <select name="sort" value={filters.sort} onChange={updateFilter}>
                <option value="created_at">По дате добавления</option>
                <option value="title">По названию</option>
                <option value="release_year">По году</option>
                <option value="reviews_avg_rating">По рейтингу</option>
              </select>
            </label>
            <label>
              Порядок
              <select name="order" value={filters.order} onChange={updateFilter}>
                <option value="desc">По убыванию</option>
                <option value="asc">По возрастанию</option>
              </select>
            </label>
          </div>
        </details>

        <div className="filter-actions">
          <label className="check-label">
            <input type="checkbox" name="available" checked={filters.available} onChange={updateFilter} />
            Только свободные сегодня
          </label>
          <button type="submit">Найти</button>
          <button type="button" onClick={resetFilters}>Сбросить</button>
        </div>
      </form>

      <div aria-busy={loading}>
        {loading ? <p className="empty-state" role="status">Загрузка фильмов…</p> : error ? (
          <p className="empty-state error-message" role="alert">{error}</p>
        ) : movies.length === 0 ? (
          <p className="empty-state">Фильмы не найдены.</p>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map(movie => (
                <article className="movie-card" key={movie.id}>
                  <div className="movie-card-top">
                    <span>{movie.genres.map(genre => genre.name).join(', ') || 'Жанры не указаны'}</span>
                    {movie.reviews_avg_rating != null && (
                      <span className="movie-rating">{Number(movie.reviews_avg_rating).toFixed(1)} / 10</span>
                    )}
                  </div>
                  <h2><Link to={`/movies/${movie.id}`}>{movie.title}</Link></h2>
                  <p className="movie-meta">{[movie.release_year, movie.duration && `${movie.duration} мин`].filter(Boolean).join(' · ')}</p>
                  {movie.description && <p className="movie-description">{movie.description}</p>}
                  <Link className="movie-card-link" to={`/movies/${movie.id}`} aria-label={`Подробнее о фильме «${movie.title}»`}>
                    Подробнее <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
            {meta?.last_page > 1 && (
              <nav className="pagination" aria-label="Страницы каталога">
                <button disabled={query.page === 1} onClick={() => changePage(-1)}>Назад</button>
                <span>Страница {meta.current_page} из {meta.last_page}</span>
                <button disabled={query.page >= meta.last_page} onClick={() => changePage(1)}>Вперёд</button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MovieList;
