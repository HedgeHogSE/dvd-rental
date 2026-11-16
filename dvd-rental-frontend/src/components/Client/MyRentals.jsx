import { useState, useEffect } from 'react';
import api from '../../services/api';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchRentals(page);
  }, [page]);

  const fetchRentals = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/rentals', { params: { page: currentPage, per_page: 15 } });
      setRentals(response.data.data); // Читаем из data.data
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки аренд');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && rentals.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Мои аренды</h1>
      
      {rentals.length === 0 ? (
        <p>У вас нет аренд</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата выдачи</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата возврата</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(rental => (
                  <tr key={rental.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.dvd?.inventory_number}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.dvd?.movie?.title}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <span style={{ 
                        color: rental.status === 'active' ? 'green' : 'blue',
                        fontWeight: 'bold'
                      }}>
                        {rental.status === 'active' ? 'Активна' : 'Возвращена'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.price} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
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

export default MyRentals;