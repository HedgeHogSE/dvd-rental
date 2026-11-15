import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyWishlist = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchWishlist(page);
  }, [page]);

  const fetchWishlist = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/me/wishlist', { params: { page: currentPage, per_page: 12 } });
      setMovies(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки списка желаемого');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (movieId) => {
    if (!window.confirm('Удалить фильм из списка?')) return;
    try {
      await api.delete(`/me/wishlist/${movieId}`);
      setMovies(movies.filter(m => m.id !== movieId));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  if (loading && movies.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Мой список желаемого</h1>
      
      {movies.length === 0 ? (
        <p>Ваш список пуст. Добавляйте фильмы со страницы фильма.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {movies.map(movie => (
              <div key={movie.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3>{movie.title}</h3>
                <p><strong>Жанр:</strong> {movie.genre?.name || '-'}</p>
                <p><strong>Год:</strong> {movie.release_year}</p>
                <p><strong>Рейтинг:</strong> {movie.reviews_avg_rating ? `${Number(movie.reviews_avg_rating).toFixed(1)} / 10` : 'Нет оценок'}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <Link to={`/movies/${movie.id}`} style={{ padding: '5px 10px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                    Подробнее
                  </Link>
                  <button onClick={() => removeFromWishlist(movie.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
              <span>Страница {meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Вперёд</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyWishlist;