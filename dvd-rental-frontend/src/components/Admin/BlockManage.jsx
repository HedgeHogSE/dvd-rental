import { useState, useEffect } from 'react';
import api from '../../services/api';

const BlockManage = () => {
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
=======
  const [error, setError] = useState('');
>>>>>>> feature/functionality
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    reason: '',
    expires_at: ''
  });

<<<<<<< HEAD
  useEffect(() => {
    fetchBlocks();
    fetchUsers();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await api.get('/blocks');
      setBlocks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки блокировок:', error);
=======
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
>>>>>>> feature/functionality
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
<<<<<<< HEAD
      const response = await api.get('/users');
      setUsers(response.data);
=======
      const response = await api.get('/users', { params: { per_page: 100 } });
      setUsers(response.data.data || []);
>>>>>>> feature/functionality
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
<<<<<<< HEAD
      console.error('Ошибка удаления:', error);
=======
      alert(error.response?.data?.message || 'Ошибка удаления');
>>>>>>> feature/functionality
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
<<<<<<< HEAD
      fetchBlocks();
    } catch (error) {
      console.error('Ошибка создания блокировки:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;
=======
      fetchBlocks(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка создания блокировки');
    }
  };

  if (loading && blocks.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Управление блокировками</h1>
      
      <button onClick={() => setShowForm(true)} style={{ marginBottom: '20px', padding: '10px' }}>
        + Заблокировать пользователя
      </button>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
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
              <small style={{ color: '#666' }}>Оставьте пустым для постоянной блокировки</small>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Заблокировать
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {blocks.length === 0 ? (
        <p>Активные блокировки не найдены</p>
      ) : (
<<<<<<< HEAD
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Причина</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Срок</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(block => (
                <tr key={block.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{block.user?.name} ({block.user?.email})</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{block.reason}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {block.expires_at 
                      ? new Date(block.expires_at).toLocaleDateString() 
                      : <span style={{ color: 'red' }}>Постоянная</span>}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => handleDelete(block.id)} style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Снять
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
=======
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Причина</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Срок</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => (
                  <tr key={block.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{block.user?.name} ({block.user?.email})</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{block.reason}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {block.expires_at 
                        ? new Date(block.expires_at).toLocaleDateString() 
                        : <span style={{ color: 'red' }}>Постоянная</span>}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleDelete(block.id)} style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Снять
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
              <span>{meta.current_page} из {meta.last_page}</span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Вперёд</button>
            </div>
          )}
        </>
>>>>>>> feature/functionality
      )}
    </div>
  );
};

export default BlockManage;