
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [student, setStudent] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("campushubToken");

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setError("Please log in again to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load profile.");
        }

        setStudent(data.student);
        setName(data.student.full_name || "");
        setPhone(data.student.phone || "");

        localStorage.setItem(
          "campushubStudent",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("campushubStudent") || "{}"),
            ...data.student
          })
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: name,
          phone: phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed.");
      }

      setStudent(data.student);
      setName(data.student.full_name || "");
      setPhone(data.student.phone || "");

      localStorage.setItem(
        "campushubStudent",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("campushubStudent") || "{}"),
          ...data.student
        })
      );

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0 18px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px"
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading profile...</h2>;
  }

  if (error && !student) {
    return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;
  }

  if (!student) {
    return <h2>Please log in to view your profile.</h2>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "auto",
        background: "white",
        padding: "30px",
        borderRadius: "14px"
      }}>
        <h1>My Profile</h1>
        <p>View and manage your CampusHub details.</p>

        <form onSubmit={handleSave}>
          <label>Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            style={inputStyle}
          />

          <label>Email</label>
          <input
            value={student.email || ""}
            disabled
            style={inputStyle}
          />

          <label>Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={20}
            style={inputStyle}
          />

          <label>Student ID</label>
          <input
            value={student.id || ""}
            disabled
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "13px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ marginTop: "20px" }}>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

export default Profile;
