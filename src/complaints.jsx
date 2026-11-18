
import "./complaint.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Complaints() {
  const studentData = localStorage.getItem("campushubStudent");
  const student = studentData ? JSON.parse(studentData) : null;

  const [complaints, setComplaints] = useState([]);

  const [form, setForm] = useState({
    category: "Maintenance",
    location: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Load complaints from MySQL
  async function loadComplaints() {
    if (!student?.id) {
      setMessage("Please log in to view your complaints.");
      return;
    }

    setFetching(true);

    try {
      const token = localStorage.getItem("campushubToken");

const response = await fetch(
  "https://campushub-production-5af35267.up.railway.app/api/complaints",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const data = await response.json();

      if (response.ok) {
        setComplaints(data.complaints || []);
        setMessage("");
      } else {
        setMessage(data.message || "Could not load complaints.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  // Submit complaint
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!student?.id) {
      setMessage("Please log in before submitting a complaint.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("campushubToken");

const response = await fetch(
  "https://campushub-production-5af35267.up.railway.app/api/complaints",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category: form.category,
      location: form.location,
      description: form.description,
    }),
  }
);

      const data = await response.json();

      if (response.ok) {
        setForm({
          category: "Maintenance",
          location: "",
          description: "",
        });

        setMessage("Complaint submitted successfully!");

        await loadComplaints();
      } else {
        setMessage(data.message || "Complaint submission failed.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Status colours
  function getStatusStyle(status) {
    const styles = {
      Submitted: {
        background: "#dbeafe",
        color: "#1d4ed8",
      },
      Pending: {
        background: "#fef3c7",
        color: "#92400e",
      },
      "In Progress": {
        background: "#ede9fe",
        color: "#6d28d9",
      },
      Resolved: {
        background: "#dcfce7",
        color: "#166534",
      },
    };

    return styles[status] || {
      background: "#e2e8f0",
      color: "#334155",
    };
  }

  return (
    <div className="complaints-page">

      <header className="complaints-header">
        <h1>Complaint Management</h1>
        <p>Report problems and track their progress.</p>
      </header>

      <main className="complaints-container">

        {/* SUBMIT COMPLAINT */}
        <section className="complaint-form-card">
          <h2>Submit a Complaint</h2>

          <form onSubmit={handleSubmit}>
            <label>Complaint Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Mess Food">Mess Food</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>

            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="e.g. Hostel Room 204"
              value={form.location}
              onChange={handleChange}
              required
            />

            <label>Complaint Description</label>

            <textarea
              name="description"
              placeholder="Explain the problem..."
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />

            <button
              type="submit"
              className="complaint-submit-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>

          {message && (
            <p style={{ marginTop: "15px" }}>
              {message}
            </p>
          )}
        </section>

        {/* COMPLAINT TRACKING */}
        <section className="complaint-list-card">

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <h2>My Complaints</h2>

            <button
              onClick={loadComplaints}
              disabled={fetching}
              style={{
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {fetching ? "Refreshing..." : "Refresh Status"}
            </button>
          </div>

          {fetching && complaints.length === 0 && (
            <p>Loading your complaints...</p>
          )}

          {!fetching && complaints.length === 0 && !message && (
            <p className="empty-complaints">
              You haven't submitted any complaints yet.
            </p>
          )}

          {complaints.map((complaint) => (
            <article
              className="complaint-item"
              key={complaint.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "18px"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <h3>{complaint.category}</h3>

                <span style={{
                  ...getStatusStyle(complaint.status),
                  padding: "7px 13px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}>
                  {complaint.status}
                </span>
              </div>

              <p>
                <strong>Complaint ID:</strong> #{complaint.id}
              </p>

              <p>
                <strong>Location:</strong> {complaint.location}
              </p>

              <p>
                <strong>Description:</strong> {complaint.description}
              </p>

              <p>
                <strong>Submitted On:</strong>{" "}
                {new Date(complaint.created_at).toLocaleDateString()}
              </p>

              <p style={{
                color: "#64748b",
                fontSize: "13px"
              }}>
                {complaint.status === "Resolved"
                  ? "Your complaint has been resolved."
                  : complaint.status === "In Progress"
                  ? "Your complaint is currently being worked on."
                  : complaint.status === "Pending"
                  ? "Your complaint is waiting for action."
                  : "Your complaint has been received."}
              </p>
            </article>
          ))}

          {message && (
            <p style={{ color: "#dc2626", marginTop: "15px" }}>
              {message}
            </p>
          )}

        </section>

        <Link to="/dashboard" className="complaint-back-link">
          ← Back to Dashboard
        </Link>

      </main>
    </div>
  );
}

export default Complaints;
