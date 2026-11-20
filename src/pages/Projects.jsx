import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../api';

function Projects() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Si venimos del registro, mostramos un mensaje de bienvenida
  const [showWelcome, setShowWelcome] = useState(Boolean(location.state?.justRegistered));

  useEffect(() => {
    if (!showWelcome) return;
    // Se limpia el aviso del historial, para que no reaparezca al recargar la página
    navigate('/projects', { replace: true, state: null });
    // El mensaje desaparece solo a los 5 segundos
    const timer = setTimeout(() => setShowWelcome(false), 60000);
    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <main>
      {showWelcome && <p role="status">Account created. Welcome, {user.username}!</p>}
      <h1>Projects</h1>
      <p>Logged in as {user.username} ({user.role})</p>
      <button onClick={handleLogout}>Log out</button>
    </main>
  );
}

export default Projects;