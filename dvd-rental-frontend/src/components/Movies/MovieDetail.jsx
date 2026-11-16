import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Ошибка загрузки фильма:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;
  if (!movie) return <div style={{ textAlign: 'center', padding: '48px 0' }}>Фильм не найден</div>;

  return (
    <div>
      <Link to="/movies" style={{ display: 'block', marginBottom: '24px', color: 'var(--primary-color)', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' }}>
        ← Назад к списку
      </Link>
      
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>{movie.title}</h1>
      
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '320px', background: 'var(--card-bg)', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Жанр</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '16px' }}>{movie.genre?.name || 'Неизвестно'}</span>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Год выпуска</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '16px' }}>{movie.release_year}</span>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Длительность</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '16px' }}>{movie.duration} минут</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Описание</span>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{movie.description}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: '600' }}>DVD этого фильма</h2>
        {movie.dvds && movie.dvds.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {movie.dvds.map(dvd => (
              <div key={ dvd.id } style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Инв. номер</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{dvd.inventory_number}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Статус</span>
                  <span style={{ 
                    background: dvd.status === 'available' ? 'rgba(40, 167, 69, 0.1)' : 
                               dvd.status === 'rented' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                    color: dvd.status === 'available' ? 'var(--success-color)' : 
                             dvd.status === 'rented' ? 'var(--danger-color)' : 'var(--warning-color)',
                    padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '13px', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {dvd.status === 'available' ? 'Доступен' : 
                     dvd.status === 'rented' ? 'В аренде' : 
                     dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)' }}>Цена за день</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{dvd.price_per_day} ₽</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>Для этого фильма нет DVD в наличии</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;