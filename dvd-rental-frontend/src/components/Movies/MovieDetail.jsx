import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthSession } from '../Auth/AuthSession';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Отзывы
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 10, text: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Редактирование отзыва
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 10, text: '' });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Текущий пользователь
  const { user: currentUser } = useAuthSession();

  const fetchMovie = useCallback(async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);

      const wishlistRes = await api.get('/me/wishlist');
      const inWl = wishlistRes.data.data?.some(m => m.id === parseInt(id));
      setInWishlist(inWl);
    } catch (error) {
      console.error('Ошибка загрузки фильма:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async (page = 1) => {
    try {
      const response = await api.get(`/movies/${id}/reviews`, { params: { page, per_page: 5 } });
      setReviews(response.data.data);
      setReviewMeta(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  useEffect(() => {
    fetchReviews(reviewPage);
  }, [fetchReviews, reviewPage]);

  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/me/wishlist/${id}`);
        setInWishlist(false);
      } else {
        await api.post('/me/wishlist', { movie_id: id });
        setInWishlist(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при работе с wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post(`/movies/${id}/reviews`, reviewForm);
      setReviewSuccess('Отзыв успешно добавлен!');
      setReviewForm({ rating: 10, text: '' });
      fetchReviews(1);
      setReviewPage(1);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Ошибка при добавлении отзыва. Возможно, вы не брали этот фильм в аренду.');
    }
  };

  // Начать редактирование
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditForm({ rating: review.rating, text: review.text || '' });
    setEditError('');
  };

  // Отменить редактирование
  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditForm({ rating: 10, text: '' });
    setEditError('');
  };

  // Сохранить изменения
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      await api.put(`/reviews/${editingReviewId}`, editForm);
      cancelEditing();
      fetchReviews(reviewPage);
      // Обновляем рейтинг фильма (средний рейтинг мог измениться)
      fetchMovie();
    } catch (error) {
      setEditError(error.response?.data?.message || 'Ошибка при сохранении отзыва');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews(reviewPage);
      fetchMovie();
    } catch (error) {
      alert('Ошибка: ' + (error.response?.data?.message || 'не удалось удалить отзыв'));
    }
  };

  // Форматирование рейтинга (округление до 1 знака)
  const formatRating = (value) => {
    if (value === null || value === undefined) return null;
    return Number(value).toFixed(1);
  };

  if (loading) return <div>Загрузка...</div>;
  if (!movie) return <div>Фильм не найден</div>;

  return (
    <div>
      <Link className="back-link" to="/movies">← К каталогу</Link>

      <header className="detail-heading">
        <div>
          <h1>{movie.title}</h1>
          <div className="detail-meta">
            {[movie.genres.map(genre => genre.name).join(', '), movie.release_year, movie.duration && `${movie.duration} мин`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <button type="button" onClick={toggleWishlist} disabled={wishlistLoading}>
          {inWishlist ? 'Убрать из избранного' : 'В избранное'}
        </button>
      </header>
      <p className="detail-meta">
        {movie.reviews_avg_rating != null ? `${formatRating(movie.reviews_avg_rating)} / 10` : 'Нет оценок'}
        {' · '}Отзывов: {movie.reviews_count || 0}
      </p>
      {movie.description && <p className="detail-description">{movie.description}</p>}

      <section className="detail-section">
        <h2>DVD этого фильма</h2>
        {movie.dvds?.length > 0 ? (
          <ul className="disc-list">
            {movie.dvds.map(dvd => (
              <li className="disc-row" key={dvd.id}>
                <strong>{dvd.inventory_number}</strong>
                <span style={{ color: dvd.status === 'available' ? 'var(--success)' : 'var(--muted)' }}>
                  {{ available: 'Доступен', reserved: 'Есть брони', rented: 'В аренде', unavailable: 'Недоступен' }[dvd.status]}
                </span>
                <span>{dvd.price_per_day} ₽ в день</span>
                {dvd.status !== 'unavailable' && (
                  <Link className="button-link button-link-primary" to={`/bookings/new?dvd_id=${dvd.id}`}>
                    Выбрать даты
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Для этого фильма нет DVD в наличии.</p>
        )}
      </section>

      {/* Блок Отзывов */}
      <div className="detail-section">
        <h2>Отзывы</h2>

        {reviews.length === 0 ? (
          <p>Пока нет отзывов. Будьте первым!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {reviews.map(review => {
              const isOwn = currentUser.id === review.user_id;
              const isEditing = editingReviewId === review.id;

              // Режим редактирования
              if (isEditing) {
                return (
                  <div key={review.id} style={{ background: 'var(--warning-bg)', padding: '15px', borderRadius: '3px', border: '1px solid var(--line)' }}>
                    <strong style={{ display: 'block', marginBottom: '10px' }}>
                      Редактирование отзыва
                    </strong>
                    <form onSubmit={handleEditSubmit}>
                      <div style={{ marginBottom: '10px' }}>
                        <label>Оценка (1-10): </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editForm.rating}
                          onChange={e => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                          required
                          style={{ width: '80px', padding: '5px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <textarea
                          placeholder="Текст отзыва..."
                          value={editForm.text}
                          onChange={e => setEditForm({ ...editForm, text: e.target.value })}
                          style={{ width: '100%', minHeight: '80px', padding: '10px' }}
                        />
                      </div>
                      {editError && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{editError}</div>}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          disabled={editSaving}
                          style={{ padding: '8px 15px', background: 'var(--success)', color: 'var(--surface)', border: 'none', borderRadius: '4px', cursor: editSaving ? 'not-allowed' : 'pointer' }}
                        >
                          {editSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={editSaving}
                          style={{ padding: '8px 15px', background: 'var(--muted)', color: 'var(--surface)', border: 'none', borderRadius: '4px', cursor: editSaving ? 'not-allowed' : 'pointer' }}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                );
              }

              // Обычный режим просмотра
              return (
                <div key={review.id} style={{ background: 'var(--wash)', padding: '15px', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{review.user?.name || 'Пользователь'}</strong>
                    <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>★ {formatRating(review.rating)} / 10</span>
                  </div>
                  <p style={{ margin: 0 }}>{review.text || 'Без текста'}</p>
                  <small style={{ color: 'var(--muted)' }}>{new Date(review.created_at).toLocaleDateString()}</small>

                  {/* Кнопки редактирования/удаления для собственного отзыва */}
                  {isOwn && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => startEditing(review)}
                        style={{ padding: '3px 8px', background: 'var(--warning-bg)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        style={{ padding: '3px 8px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Пагинация отзывов */}
        {reviewMeta && reviewMeta.last_page > 1 && (
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button disabled={reviewPage === 1} onClick={() => setReviewPage(p => p - 1)}>Назад</button>
            <span>{reviewPage} из {reviewMeta.last_page}</span>
            <button disabled={reviewPage === reviewMeta.last_page} onClick={() => setReviewPage(p => p + 1)}>Вперёд</button>
          </div>
        )}

        {/* Форма добавления отзыва */}
        <div style={{ marginTop: '30px', background: 'var(--wash)', padding: '20px', borderRadius: '3px' }}>
          <h3>Оставить отзыв</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Оставлять отзывы могут только те, кто брал этот фильм в аренду и вернул его.</p>
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Оценка (1-10): </label>
              <input
                type="number"
                min="1"
                max="10"
                value={reviewForm.rating}
                onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                required
                style={{ width: '80px', padding: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Ваш отзыв..."
                value={reviewForm.text}
                onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                style={{ width: '100%', minHeight: '80px', padding: '10px' }}
              />
            </div>
            {reviewError && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{reviewError}</div>}
            {reviewSuccess && <div style={{ color: 'var(--success)', marginBottom: '10px' }}>{reviewSuccess}</div>}
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--success)', color: 'var(--surface)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Отправить отзыв
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
