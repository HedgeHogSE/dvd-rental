import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const fieldStyle = { display: 'grid', gap: '5px', marginBottom: '15px' };

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const [selectedDvdId, setSelectedDvdId] = useState(() => searchParams.get('dvd_id') ?? '');
  const [dvds, setDvds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [catalogError, setCatalogError] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPage = page => api.get('/dvds', {
      params: { bookable: true, per_page: 100, page },
      signal: controller.signal,
    });

    const loadDvds = async () => {
      try {
        const { data } = await fetchPage(1);
        const pages = Array.from({ length: data.last_page - 1 }, (_, index) => index + 2);
        const results = await Promise.all(pages.map(fetchPage));
        if (!controller.signal.aborted) setDvds([...data.data, ...results.flatMap(result => result.data.data)]);
      } catch {
        if (!controller.signal.aborted) setCatalogError('Не удалось загрузить список DVD.');
      }
    };

    loadDvds();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDvdId) return;
    const controller = new AbortController();

    api.get(`/dvds/${selectedDvdId}/availability`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setSchedule({ ...data, dvdId: selectedDvdId });
      })
      .catch(() => {
        if (!controller.signal.aborted) setScheduleError('Не удалось загрузить занятые даты.');
      });

    return () => controller.abort();
  }, [selectedDvdId, refresh]);

  const availability = schedule?.dvdId === selectedDvdId ? schedule : null;
  const today = availability?.today ?? new Date().toLocaleDateString('sv-SE');
  const conflict = availability?.bookings.find(period => (
    startDate && endDate && period.start_date <= endDate && period.end_date >= startDate
  ));
  const rental = availability?.rental;
  const rentalConflict = rental && (rental.end_date === null || (startDate && startDate <= rental.end_date));

  const reloadSchedule = () => {
    setSchedule(null);
    setScheduleError('');
    setRefresh(current => current + 1);
  };

  const changeDvd = (event) => {
    setSelectedDvdId(event.target.value);
    setSchedule(null);
    setScheduleError('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/bookings', { dvd_id: selectedDvdId, start_date: startDate, end_date: endDate });
      setSuccess(true);
    } catch (error) {
      const data = error.response?.data;
      setError(Object.values(data?.errors ?? {}).flat()[0] || data?.message || 'Ошибка при создании бронирования');
      reloadSchedule();
    } finally {
      setLoading(false);
    }
  };

  if (success) return <Navigate to="/bookings" replace />;

  return (
    <div>
      <h1>Создать бронирование</h1>
      {catalogError && <p className="error-message" role="alert">{catalogError}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: 0 }}>
          <label style={fieldStyle}>
            DVD
            <select value={selectedDvdId} onChange={changeDvd} required>
              <option value="">Выберите DVD</option>
              {selectedDvdId && !dvds.some(dvd => String(dvd.id) === selectedDvdId) && (
                <option value={selectedDvdId}>DVD №{selectedDvdId}</option>
              )}
              {dvds.map(dvd => (
                <option key={dvd.id} value={dvd.id}>
                  {dvd.inventory_number} · {dvd.movie?.title} · {dvd.price_per_day} ₽/день
                </option>
              ))}
            </select>
          </label>

          {selectedDvdId && (
            <section className="empty-state" style={{ marginBottom: '15px' }} aria-label="Доступность DVD">
              <h2>Занятые даты</h2>
              {scheduleError ? <p role="alert">{scheduleError}</p> : !availability ? (
                <p role="status">Загрузка…</p>
              ) : (
                <>
                  {availability.unavailable && <p>DVD недоступен для бронирования.</p>}
                  {rental && <p>{rental.end_date === null
                    ? 'DVD в аренде. Новые брони доступны после фактического возврата.'
                    : `DVD в аренде до ${rental.end_date} включительно.`}</p>}
                  {availability.bookings.length > 0 && (
                    <ul>
                      {availability.bookings.map(period => (
                        <li key={`${period.start_date}-${period.end_date}`}>
                          {period.start_date} — {period.end_date}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!availability.unavailable && !rental && availability.bookings.length === 0 && <p>Занятых дат нет.</p>}
                </>
              )}
              {(availability || scheduleError) && <button type="button" onClick={reloadSchedule}>Обновить даты</button>}
            </section>
          )}

          <label style={fieldStyle}>
            Дата начала
            <input type="date" value={startDate} onInput={event => setStartDate(event.currentTarget.value)} required min={today} />
          </label>
          <label style={fieldStyle}>
            Дата окончания
            <input type="date" value={endDate} onInput={event => setEndDate(event.currentTarget.value)} required min={startDate || today} />
          </label>

          {conflict && <p className="error-message" role="status">Период пересекается с бронью {conflict.start_date} — {conflict.end_date}.</p>}
          {rentalConflict && rental.end_date && <p className="error-message" role="status">Выберите дату после планового возврата.</p>}
          {error && <p className="error-message" role="alert">{error}</p>}

          <button type="submit" disabled={loading || !availability || availability.unavailable || Boolean(conflict) || Boolean(rentalConflict)}>
            {loading ? 'Создание…' : 'Создать бронирование'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default BookingForm;
