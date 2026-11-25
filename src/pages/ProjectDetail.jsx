import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, getUser } from "../api";
import PhaseBadge from "../components/PhaseBadge";

const TYPE_LABELS = {
  PACKAGING: "Packaging / label",
  OFFLINE_MATERIAL: "Offline material",
  DIGITAL_MATERIAL: "Digital material",
};

// Para cada fase: qué rol puede avanzarla y el texto del botón
const ADVANCE_BY_PHASE = {
  DESIGN: { role: "DESIGNER", label: "Send to review" },
  REVIEW: { role: "REGULATORY", label: "Approve" },
  APPROVED: { role: "PRINTER", label: "Mark as printed" },
};

// Importo las variables de entorno de Cloudinary para subir archivos
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function ProjectDetail() {
  const { id } = useParams(); // el id que va en la dirección /projects/:id
  const navigate = useNavigate();
  const user = getUser();

  const [project, setProject] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Estado del form de edición
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  // Carga el proyecto y su historial
  async function loadData() {
    try {
      const projectData = await apiFetch(`/projects/${id}`);
      const historyData = await apiFetch(`/projects/${id}/history`);
      setProject(projectData);
      setHistory(historyData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  // Ejecuta una acción (avanzar, devolver, editar) y recarga los datos
  // Devuelve true si ha ido bien y false si ha ido mal
  async function runAction(path, options) {
    setBusy(true);
    setError("");
    try {
      await apiFetch(path, options);
      await loadData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function handleAdvance() {
    runAction(`/projects/${id}/advance`, { method: "PATCH" });
  }

  async function handleReturn(e) {
    e.preventDefault();
    if (!reviewNote.trim()) {
      setError("A comment is required to return a project");
      return;
    }
    await runAction(`/projects/${id}/return`, {
      method: "PATCH",
      body: JSON.stringify({ reviewNote: reviewNote }),
    });
    setReviewNote("");
  }

  // Abre el form de edición con los datos actuales
  function startEdit() {
    setEditName(project.name);
    setEditType(project.type);
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editName.trim()) {
      setError("A name is required");
      return;
    }
    const ok = await runAction(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: editName.trim(), type: editType }),
    });
    if (ok) setEditing(false);
  }

  // Sube el archivo a Cloudinary y guarda su enlace en la API
  async function handleFileChange(e) {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      // 1. El navegador sube el archivo directamente a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      // 2. Guardo solo el enlace en la API
      await apiFetch(`/projects/${id}/file`, {
        method: "PATCH",
        body: JSON.stringify({ fileUrl: data.secure_url }),
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      input.value = ""; // permite volver a elegir el mismo archivo
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this project? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      navigate("/projects");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  // Si no se ha podido cargar el proyecto
  if (!project) {
    return (
      <div>
        <Link to="/projects">← Back to projects</Link>
        {error ? <p style={{ color: "red" }}>{error}</p> : <p>Loading...</p>}
      </div>
    );
  }

  // Permisos: que acciones puede hacer este usuario según su rol y la fase
  const advance = ADVANCE_BY_PHASE[project.phase];
  const canAdvance = advance && advance.role === user?.role;
  const canReturn = project.phase === "REVIEW" && user?.role === "REGULATORY";
  const canEdit = project.phase === "DESIGN" && user?.role === "DESIGNER";
  const canDelete = project.phase === "DESIGN" && user?.role === "DESIGNER";
  const canUpload = project.phase === "DESIGN" && user?.role === "DESIGNER";

  return (
    <div>
      <Link to="/projects">← Back to projects</Link>

      <h1>{project.name}</h1>
      <p>
        {TYPE_LABELS[project.type]} · <PhaseBadge phase={project.phase} />
      </p>
      <p>Created: {new Date(project.createdAt).toLocaleString()}</p>

      {project.fileUrl && (
        <p>
          File:{" "}
          <a href={project.fileUrl} target="_blank" rel="noreferrer">
            Open design file
          </a>
        </p>
      )}

      {canUpload && (
        <p>
          <label>
            {project.fileUrl ? "Replace file: " : "Upload file: "}
            <input type="file" onChange={handleFileChange} disabled={busy} />
          </label>
        </p>
      )}

      {project.reviewNote && (
        <p>
          <strong>Returned with comment:</strong> {project.reviewNote}
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {canAdvance && (
        <button onClick={handleAdvance} disabled={busy}>
          {advance.label}
        </button>
      )}

      {canReturn && (
        <form onSubmit={handleReturn}>
          <textarea
            placeholder="Reason for returning to design"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          <button type="submit" disabled={busy}>
            Return to design
          </button>
        </form>
      )}

      {canEdit && !editing && (
        <button onClick={startEdit} disabled={busy}>
          Edit project
        </button>
      )}

      {editing && (
        <form onSubmit={handleSave}>
          <label>
            Name
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </label>
          <label>
            Type
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={busy}>
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      )}

      {canDelete && (
        <button onClick={handleDelete} disabled={busy}>
          Delete project
        </button>
      )}

      <h2>History</h2>
      {history.length === 0 ? (
        <p>No changes yet.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {new Date(entry.createdAt).toLocaleString()} ·{" "}
              {entry.user.username} ({entry.user.role}):{" "}
              <PhaseBadge phase={entry.fromPhase} /> →{" "}
              <PhaseBadge phase={entry.toPhase} />
              {entry.comment && <em> — {entry.comment}</em>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectDetail;
