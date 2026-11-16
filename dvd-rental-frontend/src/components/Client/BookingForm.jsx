import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BookingForm = () => {
  const [dvds, setDvds] = useState([]);
  const [selectedDvdId, setSelectedDvdId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableDVDs();
  }, []);

  const fetchAvailableDVDs = async () => {
    try {
      const response = await api.get('/dvds');
      setDvds(response.data.filter(dvd => dvd.status === 'available'));
    } catch (error) {
      setError('Ошибка загрузки DVD');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/bookings', {
        dvd_id: selectedDvdId,
        start_date: startDate,
        end_date: endDate
      });
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '48px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--success-color)', marginBottom: '16px' }}>Бронирование успешно создано!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Переход на страницу бронирований...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)', fontWeight: '600' }}>Создать бронирование</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '520px', margin: '0 auto', padding: '32px', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px var(--shadow-color)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>DVD:</label>
          <select 
            value={selectedDvdId} 
            onChange={(e) => setSelectedDvdId(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          >
            <option value="">Выберите DVD</option>
            {dvds.map(dvd => (
              <option key={dvd.id} value={dvd.id}>
                {dvd.inventory_number} - {dvd.movie?.title} ({dvd.movie?.genre?.name}) - {dvd.price_per_day} ₽/день
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Дата начала:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Дата окончания:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            min={startDate || new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--card-bg)' }}
          />
        </div>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Создание...' : 'Создать бронирование'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;