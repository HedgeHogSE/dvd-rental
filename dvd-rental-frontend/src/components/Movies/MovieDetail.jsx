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

  if (loading) return <div>Загрузка...</div>;
  if (!movie) return <div>Фильм не найден</div>;

  return (
    <div>
      <Link to="/movies" style={{ display: 'block', marginBottom: '20px', color: '#007bff' }}>
        ← Назад к списку
      </Link>
      
      <h1>{movie.title}</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '300px' }}>
          <p><strong>Жанр:</strong> {movie.genre?.name || 'Неизвестно'}</p>
          <p><strong>Год выпуска:</strong> {movie.release_year}</p>
          <p><strong>Длительность:</strong> {movie.duration} минут</p>
          <p><strong>Описание:</strong></p>
          <p>{movie.description}</p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>DVD этого фильма</h2>
        {movie.dvds && movie.dvds.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {movie.dvds.map(dvd => (
              <div key={ dvd.id } style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Инв. номер:</strong> {dvd.inventory_number}</p>
                <p><strong>Статус:</strong> 
                  <span style={{ 
                    color: dvd.status === 'available' ? 'green' : 
                           dvd.status === 'rented' ? 'red' : 'orange' 
                  }}>
                    {dvd.status === 'available' ? 'Доступен' : 
                     dvd.status === 'rented' ? 'В аренде' : 
                     dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                  </span>
                </p>
                <p><strong>Цена за день:</strong> {dvd.price_per_day} ₽</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Для этого фильма нет DVD в наличии</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;