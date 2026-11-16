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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger-color)', padding: '24px', background: '#f8d7da', borderRadius: '4px' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Все аренды</h1>
      
      {rentals.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 0' }}>Аренды не найдены</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background-color)' }}>
              <tr>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Пользователь</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>DVD</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Бронирование</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Дата выдачи</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Дата возврата</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => (
                <tr key={rental.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{rental.user?.name}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{rental.dvd?.inventory_number} - {rental.dvd?.movie?.title}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{rental.booking_id ? `#${rental.booking_id}` : '-'}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {rental.issued_at ? new Date(rental.issued_at).toLocaleDateString('ru-RU') + ' ' + new Date(rental.issued_at).toLocaleTimeString('ru-RU') : '-'}
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {rental.returned_at ? new Date(rental.returned_at).toLocaleDateString('ru-RU') + ' ' + new Date(rental.returned_at).toLocaleTimeString('ru-RU') : '-'}
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      background: rental.status === 'active' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(23, 162, 184, 0.1)',
                      color: rental.status === 'active' ? 'var(--success-color)' : 'var(--info-color)',
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '13px', border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      {rental.status === 'active' ? 'Активна' : 'Возвращена'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{rental.price} ₽</td>
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