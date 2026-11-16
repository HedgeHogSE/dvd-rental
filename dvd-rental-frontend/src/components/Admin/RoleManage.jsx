import { useState, useEffect } from 'react';
import api from '../../services/api';

const RoleManage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState('');
<<<<<<< HEAD

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
=======
  
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => { fetchRoles(page); }, [page]);

  const fetchRoles = async (currentPage = 1) => {
    try {
      const response = await api.get('/roles', { params: { page: currentPage, per_page: 15 } });
      setRoles(response.data.data);
      setMeta(response.data);
>>>>>>> feature/functionality
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить роль?')) return;
    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r.id !== id));
    } catch (error) {
<<<<<<< HEAD
      console.error('Ошибка удаления:', error);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setName(role.name);
    setShowForm(true);
  };
=======
      alert('Ошибка удаления');
    }
  };

  const handleEdit = (role) => { setEditingRole(role); setName(role.name); setShowForm(true); };
>>>>>>> feature/functionality

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, { name });
      } else {
        await api.post('/roles', { name });
      }
      setShowForm(false);
      setEditingRole(null);
      setName('');
      fetchRoles();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;
=======
      if (editingRole) { await api.put(`/roles/${editingRole.id}`, { name }); } 
      else { await api.post('/roles', { name }); }
      setShowForm(false); setEditingRole(null); setName(''); fetchRoles(page);
    } catch (error) { alert('Ошибка сохранения'); }
  };

  if (loading && roles.length === 0) return <div>Загрузка...</div>;
>>>>>>> feature/functionality

  return (
    <div>
      <h1>Управление ролями</h1>
<<<<<<< HEAD
      
      <button onClick={() => { setShowForm(true); setEditingRole(null); }} style={{ marginBottom: '20px', padding: '10px' }}>
        + Добавить роль
      </button>

=======
      <button onClick={() => { setShowForm(true); setEditingRole(null); }} style={{ marginBottom: '20px', padding: '10px' }}>+ Добавить роль</button>
>>>>>>> feature/functionality
      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{editingRole ? 'Редактировать роль' : 'Добавить роль'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Название:</label>
<<<<<<< HEAD
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingRole ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {roles.length === 0 ? (
        <p>Роли не найдены</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Название</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
=======
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>{editingRole ? 'Сохранить' : 'Добавить'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </form>
        </div>
      )}
      {roles.length === 0 ? <p>Роли не найдены</p> : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '10px', textAlign: 'left' }}>Название</th><th style={{ padding: '10px', textAlign: 'left' }}>Действия</th></tr></thead>
>>>>>>> feature/functionality
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{role.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
<<<<<<< HEAD
                    <button onClick={() => handleEdit(role)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>
                      Ред.
                    </button>
                    <button onClick={() => handleDelete(role.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Удалить
                    </button>
=======
                    <button onClick={() => handleEdit(role)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>Ред.</button>
                    <button onClick={() => handleDelete(role.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Удалить</button>
>>>>>>> feature/functionality
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
<<<<<<< HEAD
        </div>
=======
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
<<<<<<< HEAD

=======
>>>>>>> feature/functionality
export default RoleManage;