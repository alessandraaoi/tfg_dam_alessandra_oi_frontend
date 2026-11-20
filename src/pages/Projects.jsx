import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch, clearSession, getUser } from '../api';
import PhaseBadge from '../components/PhaseBadge';

const TYPE_LABELS = {
  PACKAGING: 'Packaging / label',
  OFFLINE_MATERIAL: 'Offline material',
  DIGITAL_MATERIAL: 'Digital material',
};

function Projects() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(Boolean(location.state?.justRegistered));

  // Mensaje de bienvenida tras registrarse: desaparece solo a los 5 segundos
  useEffect(() => {
    if (!showWelcome) return;
    navigate('/projects', { replace: true, state: null });
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Pedir los proyectos a la API al abrir la pantalla
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await apiFetch('/projects');
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <main>
      {showWelcome && <p role="status">Account created. Welcome, {user.username}!</p>}
      <h1>Projects</h1>
      <p>
        Logged in as {user.username} ({user.role})
      </p>
      <button onClick={handleLogout}>Log out</button>
      {user.role === 'DESIGNER' && <Link to="/projects/new">New project</Link>}

      {loading && <p>Loading projects...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && projects.length === 0 && <p>No projects yet.</p>}

      {projects.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Phase</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{TYPE_LABELS[project.type]}</td>
                <td>
                  <PhaseBadge phase={project.phase} />
                </td>
                <td>{new Date(project.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default Projects;