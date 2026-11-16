import { useState, useEffect } from 'react';
import api from '../../services/api';

const ReturnDVD = () => {
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await api.get('/rentals');
      setRentals(response.data.filter(r => r.status === 'active'));
    } catch (error) {
      console.error('Ошибка загрузки аренд:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRentalId) {
      setError('Выберите аренду');
      return;
    }
    
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.put(`/rentals/${selectedRentalId}`);
      setSuccess(true);
      setTimeout(() => {
        setSelectedRentalId('');
        fetchRentals();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при возврате DVD');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '48px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--success-color)', marginBottom: '16px' }}>DVD успешно возвращён!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Форма сброшена.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Возврат DVD</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '520px', margin: '0 auto', padding: '32px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Аренда:</label>
          <select
            value={selectedRentalId}
            onChange={(e) => setSelectedRentalId(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          >
            <option value="">Выберите аренду</option>
            {rentals.map(rental => (
              <option key={rental.id} value={rental.id}>
                #{rental.id} - {rental.user?.name} - {rental.dvd?.inventory_number} - {rental.dvd?.movie?.title} - {rental.price} ₽
              </option>
            ))}
          </select>
        </div>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Обработка...' : 'Оформить возврат'}
        </button>
      </form>
    </div>
  );
};

export default ReturnDVD;