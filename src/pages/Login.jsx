import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, saveSession } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault(); // evita que el formulario recargue la página
    setError('');
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      saveSession(data.token, data.user);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <p>No account yet? <Link to="/register">Register</Link></p>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Log in</button>
      </form>
    </main>
  );
}

export default Login;