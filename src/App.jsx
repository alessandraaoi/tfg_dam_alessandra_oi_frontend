import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./api";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Register from "./pages/Register";
import NewProject from "./pages/NewProject";

// Si no hay sesión iniciada, redirige al login
function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
