import { useState, useEffect } from 'react';
import api from '../../services/api';

const DVDList = () => {
  const [dvds, setDvds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDVDs();
  }, []);

  const fetchDVDs = async () => {
    try {
      const response = await api.get('/dvds');
      setDvds(response.data);
    } catch (error) {
      console.error('Ошибка загрузки DVD:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>Список DVD</h1>
      
      {dvds.length === 0 ? (
        <p>DVD не найдены</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Инв. номер</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Фильм</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Жанр</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Цена/день</th>
              </tr>
            </thead>
            <tbody>
              {dvds.map(dvd => (
                <tr key={dvd.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.inventory_number}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.title || 'Неизвестно'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.movie?.genre?.name || 'Неизвестно'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ 
                      color: dvd.status === 'available' ? 'green' : 
                             dvd.status === 'rented' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {dvd.status === 'available' ? 'Доступен' : 
                       dvd.status === 'rented' ? 'В аренде' : 
                       dvd.status === 'reserved' ? 'Забронирован' : 'Недоступен'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{dvd.price_per_day} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DVDList;