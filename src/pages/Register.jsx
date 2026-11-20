import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, saveSession } from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DESIGNER');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Paso 1: crear la cuenta
    try {
      await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, role, accessCode }),
      });
    } catch (err) {
      setError(err.message);
      return; // si el registro falla, no se sigue
    }

    // Paso 2: iniciar sesión automáticamente con los mismos datos
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      saveSession(data.token, data.user);
      navigate('/projects', { state: { justRegistered: true } });
    } catch {
      // La cuenta se creó, pero el inicio de sesión automático falló
      navigate('/login');
    }
  }

  return (
    <main>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="DESIGNER">Design</option>
            <option value="REGULATORY">Regulatory</option>
            <option value="PRINTER">Printer</option>
          </select>
        </label>
        <label>
          Access code
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}

export default Register;