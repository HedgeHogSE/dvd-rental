import { useState, useEffect } from 'react';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Обновляем счетчик каждые 30 секунд
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/me/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      // Игнорируем ошибки (например, если пользователь не авторизован)
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/me/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/me/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="notification">
      <button type="button" onClick={toggleDropdown} aria-expanded={isOpen} aria-controls="notification-panel">
        Уведомления
        {unreadCount > 0 && <span className="notification-count">({unreadCount})</span>}
      </button>

      {isOpen && (
        <section className="notification-panel" id="notification-panel" aria-label="Уведомления">
          <div className="notification-heading">
            <strong>Уведомления</strong>
            {unreadCount > 0 && <button type="button" onClick={markAllAsRead}>Прочитать все</button>}
          </div>
          <div className="notification-entries">
            {loading ? (
              <p className="notification-entry" role="status">Загрузка…</p>
            ) : notifications.length === 0 ? (
              <p className="notification-entry">Нет уведомлений</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className={notification.read_at ? 'notification-entry' : 'notification-entry notification-unread'}>
                  <p>{notification.data.message}</p>
                  <small>{new Date(notification.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
