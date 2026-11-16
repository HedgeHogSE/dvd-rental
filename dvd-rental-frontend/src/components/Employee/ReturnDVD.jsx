import { useState, useEffect } from 'react';
import api from '../../services/api';

const ReturnDVD = () => {
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

<<<<<<< HEAD
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
=======
  useEffect(() => { fetchActiveRentals(); }, []);

  const fetchActiveRentals = async () => {
    try {
      const response = await api.get('/rentals', { params: { status: 'active', per_page: 100 } });
      setRentals(response.data.data || []);
    } catch (error) { console.error(error); }
>>>>>>> feature/functionality
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
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
      <div>
        <h2 style={{ color: 'green' }}>DVD успешно возвращён!</h2>
        <p>Форма сброшена.</p>
      </div>
    );
  }
=======
    if (!selectedRentalId) { setError('Выберите аренду'); return; }
    setError(''); setSuccess(false); setLoading(true);
    try {
      await api.put(`/rentals/${selectedRentalId}`);
      setSuccess(true);
      setTimeout(() => { setSelectedRentalId(''); fetchActiveRentals(); }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при возврате');
    } finally { setLoading(false); }
  };

  if (success) return <div><h2 style={{ color: 'green' }}>DVD успешно возвращён!</h2></div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Возврат DVD</h1>
<<<<<<< HEAD
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Аренда:</label>
          <select
            value={selectedRentalId}
            onChange={(e) => setSelectedRentalId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Выберите аренду</option>
            {rentals.map(rental => (
              <option key={rental.id} value={rental.id}>
                #{rental.id} - {rental.user?.name} - {rental.dvd?.inventory_number} - {rental.dvd?.movie?.title} - {rental.price} ₽
              </option>
            ))}
          </select>
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Обработка...' : 'Оформить возврат'}
        </button>
=======
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Аренда:</label>
          <select value={selectedRentalId} onChange={(e) => setSelectedRentalId(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
            <option value="">Выберите аренду</option>
            {rentals.map(r => <option key={r.id} value={r.id}>#{r.id} - {r.user?.name} - {r.dvd?.inventory_number} - {r.dvd?.movie?.title} - {r.price} ₽</option>)}
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>{loading ? 'Обработка...' : 'Оформить возврат'}</button>
>>>>>>> feature/functionality
      </form>
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> feature/functionality
export default ReturnDVD;