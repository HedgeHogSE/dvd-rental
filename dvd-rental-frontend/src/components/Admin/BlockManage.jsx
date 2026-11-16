import { useState, useEffect } from 'react';
import api from '../../services/api';

const BlockManage = () => {
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    reason: '',
    expires_at: ''
  });

  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchBlocks(page);
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchBlocks = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/blocks', { params: { page: currentPage, per_page: 15 } });
      setBlocks(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки блокировок');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { per_page: 100 } });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Снять блокировку?')) return;
    try {
      await api.delete(`/blocks/${id}`);
      setBlocks(blocks.filter(b => b.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/blocks', {
        user_id: formData.user_id,
        reason: formData.reason,
        expires_at: formData.expires_at || null
      });
      setShowForm(false);
      setFormData({ user_id: '', reason: '', expires_at: '' });
      fetchBlocks(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка создания блокировки');
    }
  };

  if (loading && blocks.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Управление блокировками</h1>
      
      <button onClick={() => setShowForm(true)} style={{ marginBottom: '20px', padding: '10px' }}>
        + Заблокировать пользователя
      </button>

      {showForm && (
        <div style={{ background: 'var(--wash)', padding: '20px', marginBottom: '20px', borderRadius: '3px' }}>
          <h3>Создать блокировку</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Пользователь:</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Выберите пользователя</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Причина:</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Срок окончания (опционально, формат YYYY-MM-DD):</label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              <small style={{ color: 'var(--muted)' }}>Оставьте пустым для постоянной блокировки</small>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              Заблокировать
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: 'var(--muted)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {blocks.length === 0 ? (
        <p>Активные блокировки не найдены</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Причина</th>
                  <th>Срок</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => (
                  <tr key={block.id}>
                    <td>{block.user?.name} ({block.user?.email})</td>
                    <td>{block.reason}</td>
                    <td>
                      {block.expires_at 
                        ? new Date(block.expires_at).toLocaleDateString() 
                        : <span style={{ color: 'var(--danger)' }}>Постоянная</span>}
                    </td>
                    <td>
                      <button onClick={() => handleDelete(block.id)} style={{ padding: '5px 10px', background: 'var(--success)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
                        Снять
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
              <span>{meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Вперёд</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlockManage;