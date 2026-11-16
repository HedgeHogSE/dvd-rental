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
    <div style={{ position: 'relative', marginRight: '20px' }}>
      <button 
        onClick={toggleDropdown}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '-5px', right: '-10px', 
            background: 'red', color: 'white', borderRadius: '50%', 
            padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' 
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '35px', right: '0', width: '300px', 
          background: '#fff', border: '1px solid #ddd', borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, color: '#333' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <strong>Уведомления</strong>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px' }}>
                Прочитать все
              </button>
            )}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Нет уведомлений</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', background: n.read_at ? '#fff' : '#f0f8ff' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{n.data.message}</p>
                  <small style={{ color: '#999' }}>{new Date(n.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;