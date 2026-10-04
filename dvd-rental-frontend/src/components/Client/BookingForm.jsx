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
      <div>
        <h2 style={{ color: 'green' }}>Бронирование успешно создано!</h2>
        <p>Переход на страницу бронирований...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Создать бронирование</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>DVD:</label>
          <select 
            value={selectedDvdId} 
            onChange={(e) => setSelectedDvdId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Выберите DVD</option>
            {dvds.map(dvd => (
              <option key={dvd.id} value={dvd.id}>
                {dvd.inventory_number} - {dvd.movie?.title} ({dvd.movie?.genre?.name}) - {dvd.price_per_day} ₽/день
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Дата начала:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Дата окончания:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            min={startDate || new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Создание...' : 'Создать бронирование'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;