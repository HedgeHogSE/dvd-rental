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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Список DVD</h1>
      
      {dvds.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>DVD не найдены</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background-color)' }}>
              <tr>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Инв. номер</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Фильм</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Жанр</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Цена/день</th>
              </tr>
            </thead>
            <tbody>
              {dvds.map(dvd => (
                <tr key={dvd.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{dvd.inventory_number}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{dvd.movie?.title || 'Неизвестно'}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{dvd.movie?.genre?.name || 'Неизвестно'}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
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
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{dvd.price_per_day} ₽</td>
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