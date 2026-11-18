
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://https://campushub-production-5af35267.up.railway.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("campushubStudent", JSON.stringify(data.student));
      localStorage.setItem("campushubToken", data.token);

      if (data.student.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f4f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <form onSubmit={handleLogin} style={{
        background: "white",
        padding: "35px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", color: "#0f172a" }}>
          CampusHub Login
        </h1>

        <p style={{ textAlign: "center", color: "#64748b" }}>
          Please log in to continue.
        </p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={inputStyle}
        />

        {message && (
          <p style={{ color: "red", textAlign: "center" }}>
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "15px"
        }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  boxSizing: "border-box"
};

export default Login;
