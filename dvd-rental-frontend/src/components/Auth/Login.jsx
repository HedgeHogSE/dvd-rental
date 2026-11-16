import { useState } from 'react';
<<<<<<< HEAD
import { useNavigate, Link } from 'react-router-dom';
=======
import { Link } from 'react-router-dom';
>>>>>>> feature/functionality
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
=======
>>>>>>> feature/functionality

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
    setLoading(true);

=======
>>>>>>> feature/functionality
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
<<<<<<< HEAD
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
=======
      window.location.href = '/'; // <--- ЖЕЛЕЗОБЕТОННАЯ ПЕРЕЗАГРУЗКА
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
>>>>>>> feature/functionality
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
<<<<<<< HEAD
        <div style={{ marginBottom: '15px' }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Пароль:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
=======
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Войти</button>
      </form>
      <p>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
>>>>>>> feature/functionality
    </div>
  );
};

export default Login;