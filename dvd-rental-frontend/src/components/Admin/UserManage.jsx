import { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_ids: []
  });

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchUsers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/users', { params: { page: currentPage, per_page: 15 } });
      setUsers(response.data.data);
      setMeta(response.data);
    } catch (error) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles', { params: { per_page: 100 } });
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleEdit = (user) => {
    setSaveError('');
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role_ids: user.roles?.map(r => r.id) || []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    const { password, ...profile } = formData;
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, profile);
      } else {
        await api.post('/users', { ...profile, password });
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', phone: '', role_ids: [] });
      fetchUsers(page);
    } catch (error) {
      setSaveError(error.response?.status === 422
        ? error.response.data.message
        : 'Не удалось сохранить пользователя. Попробуйте ещё раз.');
    }
  };

  const handleRoleChange = (roleId, isChecked) => {
    if (isChecked) {
      setFormData({ ...formData, role_ids: [...formData.role_ids, roleId] });
    } else {
      setFormData({ ...formData, role_ids: formData.role_ids.filter(id => id !== roleId) });
    }
  };

  if (loading && users.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div>
      <h1>Управление пользователями</h1>
      
      <button onClick={() => {
        setSaveError('');
        setFormData({ name: '', email: '', password: '', phone: '', role_ids: [] });
        setShowForm(true);
        setEditingUser(null);
      }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить пользователя
      </button>

      {showForm && (
        <div style={{ background: 'var(--wash)', padding: '20px', marginBottom: '20px', borderRadius: '3px' }}>
          <h3>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Имя:</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            {!editingUser && (
              <div style={{ marginBottom: '10px' }}>
                <label>Пароль (минимум 8 символов):</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength="8" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </div>
            )}
            <div style={{ marginBottom: '10px' }}>
              <label>Телефон:</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Роли:</label>
              <div>
                {roles.map(role => (
                  <div key={role.id} style={{ marginBottom: '5px' }}>
                    <label>
                      <input type="checkbox" checked={formData.role_ids.includes(role.id)} onChange={(e) => handleRoleChange(role.id, e.target.checked)} />
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {saveError && <p className="error-message" role="alert">{saveError}</p>}
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              {editingUser ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: 'var(--muted)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роли</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.roles?.map(r => r.name).join(', ') || 'Нет ролей'}</td>
                    <td>
                      <button onClick={() => handleEdit(user)} style={{ marginRight: '5px', padding: '5px 10px', background: 'var(--warning-bg)', border: 'none', cursor: 'pointer' }}>Ред.</button>
                      <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', background: 'var(--danger)', color: 'var(--surface)', border: 'none', cursor: 'pointer' }}>Удалить</button>
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

export default UserManage;
