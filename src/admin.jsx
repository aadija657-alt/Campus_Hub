
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Admin() {
  const navigate = useNavigate();

  const admin = JSON.parse(
    localStorage.getItem("campushubStudent") || "{}"
  );

  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [showStudents, setShowStudents] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    localStorage.removeItem("campushubStudent");
    localStorage.removeItem("campushubToken");
    navigate("/login");
  }

  async function loadStudents() {
    setShowStudents(true);
    setLoading(true);
    setMessage("");
    setStudents([]);

    try {
      const token = localStorage.getItem("campushubToken");

      if (!token) {
        setMessage("Token missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/students",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load students.");
        return;
      }

      setStudents(data.students || []);

      if (!data.students || data.students.length === 0) {
        setMessage("No students registered yet.");
      }
    } catch (error) {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  const sections = [
    ["Students", "View registered students"],
    ["Complaints", "View and manage complaints"],
    ["Hostels", "Manage hostel information"],
    ["Mess", "Manage mess information"],
    ["Gym", "Manage gym information"]
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      fontFamily: "Arial, sans-serif"
    }}>

      <header style={{
        background: "#0f172a",
        color: "white",
        padding: "22px 35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>CampusHub Admin TEST 123</h2>

        <button onClick={handleLogout} style={{
          padding: "10px 18px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </header>

      <main style={{ padding: "35px" }}>
        <h1>Welcome, {admin.full_name || "Admin"}!</h1>
        <p>Manage CampusHub student services from one place.</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          {sections.map(([title, description]) => (
            <div key={title} style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
            }}>
              <h2>{title}</h2>
              <p>{description}</p>

              <button
                onClick={() => {
                  if (title === "Students") {
                    loadStudents();
                  } else {
                    alert(title + " management will be added next.");
                  }
                }}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Manage
              </button>
            </div>
          ))}
        </div>

        {showStudents && (
          <section style={{
            background: "white",
            padding: "25px",
            marginTop: "35px",
            borderRadius: "12px",
            overflowX: "auto"
          }}>
            <h2>Registered Students</h2>

            {loading && <p>Loading students...</p>}

            {message && (
              <p style={{ color: "red" }}>{message}</p>
            )}

            {!loading && students.length > 0 && (
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{ background: "#e2e8f0" }}>
                    <th style={cellStyle}>ID</th>
                    <th style={cellStyle}>Name</th>
                    <th style={cellStyle}>Email</th>
                    <th style={cellStyle}>Phone</th>
                    <th style={cellStyle}>Role</th>
                    <th style={cellStyle}>Registered On</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td style={cellStyle}>{student.id}</td>
                      <td style={cellStyle}>{student.full_name}</td>
                      <td style={cellStyle}>{student.email}</td>
                      <td style={cellStyle}>{student.phone || "-"}</td>
                      <td style={cellStyle}>{student.role}</td>
                      <td style={cellStyle}>
                        {student.created_at
                          ? new Date(student.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const cellStyle = {
  border: "1px solid #cbd5e1",
  padding: "12px",
  textAlign: "left"
};

export default Admin;
