import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { getProjects, createProject, deleteProject } from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiLogOut, FiTrash2, FiUsers, FiAlertTriangle, FiFolder } from "react-icons/fi";

// Gradient palettes for project cards
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #6366f1)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f97316, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #10b981)",
];

function ProjectsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createProject(form);
      setProjects([...projects, res.data]);
      setShowModal(false);
      setForm({ name: "", description: "", color: "#6366f1" });
      toast.success("Project created! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = (projectId, e) => {
    e.stopPropagation();
    setConfirmDelete(projectId);
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteProject(confirmDelete);
      setProjects(projects.filter((p) => p._id !== confirmDelete));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">⚡ TaskFlow</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Hi, {user?.name} 👋</span>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* Hero header */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>My Projects</h1>
          <p style={styles.heroSub}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} · manage your work
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: "15px", padding: "11px 22px" }}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Content */}
      <div style={styles.container}>
        {loading ? (
          <div className="spinner">Loading projects</div>
        ) : projects.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🚀</div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>No projects yet</h2>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Create Project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project, i) => {
              const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
              const isOwner = project.owner?._id === user?.id || project.owner?._id === user?._id;
              return (
                <div
                  key={project._id}
                  className="glow-card"
                  style={styles.card}
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  {/* Gradient top strip */}
                  <div style={{ ...styles.cardStrip, background: gradient }} />

                  {/* Card icon */}
                  <div style={{ ...styles.cardIcon, background: gradient }}>
                    <FiFolder size={18} color="#fff" />
                  </div>

                  <div style={styles.cardBody}>
                    <div className="flex-between" style={{ alignItems: "flex-start" }}>
                      <h3 style={styles.cardTitle}>{project.name}</h3>
                      {isOwner && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 8px", fontSize: "12px", flexShrink: 0 }}
                          onClick={(e) => handleDelete(project._id, e)}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>

                    <p style={styles.cardDesc}>
                      {project.description || "No description provided"}
                    </p>

                    <div style={styles.cardFooter}>
                      <div style={styles.membersBadge}>
                        <FiUsers size={12} />
                        <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ ...styles.ownerDot, background: gradient }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new card */}
            <div className="glow-card" style={styles.addCard} onClick={() => setShowModal(true)}>
              <div style={styles.addIcon}><FiPlus size={28} /></div>
              <span style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>New Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✨ Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input className="input" placeholder="e.g. College Website Redesign"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="input" placeholder="What is this project about?"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Theme Color</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                  {["#6366f1","#8b5cf6","#ec4899","#06b6d4","#10b981","#f97316","#f59e0b","#ef4444"].map((c) => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", background: c, cursor: "pointer",
                        border: form.color === c ? "3px solid #fff" : "3px solid transparent",
                        boxShadow: form.color === c ? `0 0 10px ${c}` : "none", transition: "all 0.2s" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              <FiAlertTriangle color="#ef4444" />
            </div>
            <h2 style={{ marginBottom: "8px" }}>Delete Project?</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
              This will permanently delete the project and all its tasks. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteProject}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  hero: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "40px 40px 24px",
    borderBottom: "1px solid rgba(139,92,246,0.1)",
  },
  heroInner: {},
  heroTitle: {
    fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: { color: "#64748b", fontSize: "14px", marginTop: "6px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 40px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(26,26,53,0.8)",
    border: "1px solid rgba(139,92,246,0.15)",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
  cardStrip: { height: "4px" },
  cardIcon: {
    width: "40px", height: "40px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "16px 16px 0",
  },
  cardBody: { padding: "12px 16px 16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#f1f5f9", lineHeight: "1.3" },
  cardDesc: { fontSize: "13px", color: "#64748b", marginTop: "6px", lineHeight: "1.5",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" },
  membersBadge: {
    display: "flex", alignItems: "center", gap: "5px",
    fontSize: "12px", color: "#64748b",
    background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px",
  },
  ownerDot: { width: "8px", height: "8px", borderRadius: "50%" },
  addCard: {
    background: "rgba(26,26,53,0.4)",
    border: "2px dashed rgba(139,92,246,0.3)",
    borderRadius: "16px",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", minHeight: "160px",
    transition: "all 0.2s",
  },
  addIcon: {
    width: "52px", height: "52px", borderRadius: "50%",
    background: "rgba(99,102,241,0.1)", border: "2px dashed rgba(99,102,241,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#6366f1",
  },
  userChip: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "rgba(255,255,255,0.05)", padding: "6px 12px",
    borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)",
  },
  avatar: {
    width: "26px", height: "26px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", color: "#fff",
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "80px 20px", textAlign: "center",
  },
  emptyIcon: { fontSize: "56px", marginBottom: "16px" },
};

export default ProjectsPage;
