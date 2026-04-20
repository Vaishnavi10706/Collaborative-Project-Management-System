import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { registerUser } from "../services/api";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success("Account created! 🎉");
      navigate("/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>TaskFlow</span>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Start managing projects for free today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="input" type="text" name="name" placeholder="Your name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" name="password" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0a0a1a", position: "relative", overflow: "hidden", padding: "20px",
  },
  blob1: {
    position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)",
    top: "-100px", right: "-100px", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)",
    bottom: "-80px", left: "-80px", pointerEvents: "none",
  },
  card: {
    background: "rgba(18,18,42,0.9)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(139,92,246,0.2)", borderRadius: "24px",
    padding: "40px", width: "100%", maxWidth: "420px", position: "relative", zIndex: 1,
    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.08)",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" },
  logoIcon: {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
    boxShadow: "0 4px 15px rgba(236,72,153,0.4)",
  },
  logoText: {
    fontSize: "22px", fontWeight: "800",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "6px", color: "#f1f5f9" },
  sub: { color: "#64748b", fontSize: "14px", marginBottom: "28px" },
  footer: { textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#64748b" },
  link: {
    color: "#8b5cf6", textDecoration: "none", fontWeight: "600",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
};

export default RegisterPage;
