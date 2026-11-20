const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL:', API_URL);

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Función para llamar a la API: añade el token automáticamente
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Si el token ha caducado, se cierra la sesión y se vuelve al login
  if (response.status === 401 && token && path !== '/login') {
    clearSession();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  // El 204 (por ejemplo, al eliminar) no trae cuerpo
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong');
  }
  return data;
}