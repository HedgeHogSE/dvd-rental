import { useEffect, useState } from 'react';
import api from '../../services/api';

const fieldStyle = { display: 'grid', gap: '5px', marginBottom: '15px' };

const IssueDVD = () => {
  const [users, setUsers] = useState([]);
  const [dvds, setDvds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [dvdId, setDvdId] = useState('');
  const [days, setDays] = useState(1);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal, params: { per_page: 100 } };

    api.get('/users', options)
      .then(({ data }) => setUsers(data.data))
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError('Не удалось загрузить пользователей.');
      });
    api.get('/dvds', { ...options, params: { ...options.params, available_for_issue: true } })
      .then(({ data }) => setDvds(data.data))
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError('Не удалось загрузить свободные DVD.');
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const fetchPage = (page) => api.get('/bookings', {
      params: { user_id: userId, status: 'active', per_page: 100, page },
      signal: controller.signal,
    });

    const loadBookings = async () => {
      try {
        const { data } = await fetchPage(1);
        const pages = Array.from({ length: data.last_page - 1 }, (_, index) => index + 2);
        const results = await Promise.all(pages.map(fetchPage));
        if (!controller.signal.aborted) {
          setBookings([...data.data, ...results.flatMap(result => result.data.data)]);
        }
      } catch {
        if (!controller.signal.aborted) setBookingError('Не удалось загрузить бронирования.');
      } finally {
        if (!controller.signal.aborted) setLoadingBookings(false);
      }
    };

    loadBookings();
    return () => controller.abort();
  }, [userId]);

  const selectedBooking = bookings.find(booking => String(booking.id) === bookingId);

  const changeUser = (event) => {
    const nextUserId = event.target.value;
    setUserId(nextUserId);
    setBookingId('');
    setBookings([]);
    setLoadingBookings(Boolean(nextUserId));
    setBookingError('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/rentals', selectedBooking
        ? { user_id: userId, booking_id: bookingId }
        : { user_id: userId, dvd_id: dvdId, days });
      setSuccess(true);
    } catch (error) {
      const data = error.response?.data;
      setError(Object.values(data?.errors ?? {}).flat()[0] || data?.message || 'Ошибка при выдаче DVD');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <h2 style={{ color: 'var(--success)' }}>DVD успешно выдан!</h2>;
  }

  return (
    <div>
      <h1>Выдача DVD</h1>
      {catalogError && <p className="error-message" role="alert">{catalogError}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <label style={fieldStyle}>
            Пользователь
            <select value={userId} onChange={changeUser} required>
              <option value="">Выберите пользователя</option>
              {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
          </label>

          <label style={fieldStyle}>
            Бронирование
            <select value={bookingId} onChange={event => setBookingId(event.target.value)} disabled={!userId || loadingBookings}>
              <option value="">
                {loadingBookings ? 'Загрузка бронирований…' : 'Без бронирования'}
              </option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  #{booking.id} · {booking.dvd?.movie?.title} · {booking.dvd?.inventory_number}
                </option>
              ))}
            </select>
          </label>
          {bookingError && <p className="error-message" role="alert">{bookingError}</p>}

          {selectedBooking ? (
            <p>
              <strong>DVD по брони:</strong> {selectedBooking.dvd?.inventory_number} · {selectedBooking.dvd?.movie?.title}
              <br />
              Период: {selectedBooking.start_date} — {selectedBooking.end_date}
            </p>
          ) : (
            <>
              <label style={fieldStyle}>
                DVD
                <select value={dvdId} onChange={event => setDvdId(event.target.value)} required>
                  <option value="">Выберите свободный DVD</option>
                  {dvds.map(dvd => (
                    <option key={dvd.id} value={dvd.id}>
                      {dvd.inventory_number} · {dvd.movie?.title} · {dvd.price_per_day} ₽/день
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                Количество дней
                <input type="number" value={days} onChange={event => setDays(event.target.value)} required min="1" />
              </label>
            </>
          )}

          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit" disabled={!userId || loadingBookings || loading}>
            {loading ? 'Выдача…' : 'Выдать DVD'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default IssueDVD;
