import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/'; // <--- ЖЕЛЕЗОБЕТОННАЯ ПЕРЕЗАГРУЗКА
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Войти</button>
      </form>
      <p>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
    </div>
  );
};

export default Login;