import { useState, useEffect } from 'react';
import api from '../../services/api';

const RentalListAll = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await api.get('/rentals');
      setRentals(response.data);
    } catch (error) {
      setError('Ошибка загрузки аренд');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Все аренды</h1>
      
      {rentals.length === 0 ? (
        <p>Аренды не найдены</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>DVD</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Бронирование</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата выдачи</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Дата возврата</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => (
                <tr key={rental.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.user?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.dvd?.inventory_number} - {rental.dvd?.movie?.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rental.booking_id ? `#${rental.booking_id}` : '-'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString() + ' ' + new Date(rental.issued_at).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString() + ' ' + new Date(rental.returned_at).toLocaleTimeString() : '-'}
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
      )}
    </div>
  );
};

export default RentalListAll;