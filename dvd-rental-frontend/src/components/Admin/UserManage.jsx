import { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
=======
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

>>>>>>> feature/functionality
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_ids: []
  });

  useEffect(() => {
<<<<<<< HEAD
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
=======
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
>>>>>>> feature/functionality
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
<<<<<<< HEAD
      const response = await api.get('/roles');
      setRoles(response.data);
=======
      const response = await api.get('/roles', { params: { per_page: 100 } });
      setRoles(response.data.data || []);
>>>>>>> feature/functionality
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
<<<<<<< HEAD
      console.error('Ошибка удаления:', error);
=======
      alert(error.response?.data?.message || 'Ошибка удаления');
>>>>>>> feature/functionality
    }
  };

  const handleEdit = (user) => {
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
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', phone: '', role_ids: [] });
<<<<<<< HEAD
      fetchUsers();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
=======
      fetchUsers(page);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
>>>>>>> feature/functionality
    }
  };

  const handleRoleChange = (roleId, isChecked) => {
    if (isChecked) {
<<<<<<< HEAD
      setFormData({
        ...formData,
        role_ids: [...formData.role_ids, roleId]
      });
    } else {
      setFormData({
        ...formData,
        role_ids: formData.role_ids.filter(id => id !== roleId)
      });
    }
  };

  if (loading) return <div>Загрузка...</div>;
=======
      setFormData({ ...formData, role_ids: [...formData.role_ids, roleId] });
    } else {
      setFormData({ ...formData, role_ids: formData.role_ids.filter(id => id !== roleId) });
    }
  };

  if (loading && users.length === 0) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Управление пользователями</h1>
      
      <button onClick={() => { setShowForm(true); setEditingUser(null); }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить пользователя
      </button>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Имя:</label>
<<<<<<< HEAD
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
=======
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
>>>>>>> feature/functionality
            </div>
            {!editingUser && (
              <div style={{ marginBottom: '10px' }}>
                <label>Пароль (минимум 8 символов):</label>
<<<<<<< HEAD
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength="8"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
=======
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength="8" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
>>>>>>> feature/functionality
              </div>
            )}
            <div style={{ marginBottom: '10px' }}>
              <label>Телефон:</label>
<<<<<<< HEAD
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
=======
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
>>>>>>> feature/functionality
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Роли:</label>
              <div>
                {roles.map(role => (
                  <div key={role.id} style={{ marginBottom: '5px' }}>
                    <label>
<<<<<<< HEAD
                      <input
                        type="checkbox"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                      />
=======
                      <input type="checkbox" checked={formData.role_ids.includes(role.id)} onChange={(e) => handleRoleChange(role.id, e.target.checked)} />
>>>>>>> feature/functionality
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingUser ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
<<<<<<< HEAD
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Имя</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Телефон</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Роли</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.email}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.phone || '-'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {user.roles?.map(r => r.name).join(', ') || 'Нет ролей'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => handleEdit(user)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                      Ред.
                    </button>
                    <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Удалить
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
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Имя</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Телефон</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Роли</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.email}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.phone || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.roles?.map(r => r.name).join(', ') || 'Нет ролей'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEdit(user)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>Ред.</button>
                      <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Удалить</button>
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

export default UserManage;