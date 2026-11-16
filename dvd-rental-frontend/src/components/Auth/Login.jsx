import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthSession } from './AuthSession';
import api from '../../services/api';

const Login = () => {
  const { signIn } = useAuthSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      signIn(response.data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <section className="auth-panel">
      <h1>Вход</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Электронная почта
          <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error-message" role="alert">{error}</div>}
        <button type="submit">Войти</button>
      </form>
      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </section>
  );
};

export default Login;
