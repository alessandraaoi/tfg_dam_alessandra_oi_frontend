import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../api';

const TYPES = [
  { value: 'PACKAGING', label: 'Packaging / label' },
  { value: 'OFFLINE_MATERIAL', label: 'Offline material (display, stand...)' },
  { value: 'DIGITAL_MATERIAL', label: 'Digital material (banner...)' },
];

function NewProject() {
  const user = getUser();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('PACKAGING');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Solo Diseño puede crear proyectos (la API también lo comprueba)
  if (user.role !== 'DESIGNER') {
    return <Navigate to="/projects" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true); // evita enviar dos veces si se pulsa el botón rápido
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), type }),
      });
      navigate('/projects');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New project</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create project'}
        </button>
      </form>
      <p>
        <Link to="/projects">Cancel</Link>
      </p>
    </main>
  );
}

export default NewProject;