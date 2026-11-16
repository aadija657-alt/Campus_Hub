
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

  // Load complaints from MySQL
  async function loadComplaints() {
    if (!student?.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/${student.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setComplaints(data.complaints);
      } else {
        setMessage(data.message || "Could not load complaints.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server.");
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

  // Submit complaint to MySQL
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!student?.id) {
      setMessage("Please log in before submitting a complaint.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: student.id,
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

  return (
    <div className="complaints-page">
      <header className="complaints-header">
        <h1>📝 Complaint Management</h1>
        <p>Report a problem and keep track of its status.</p>
      </header>

      <main className="complaints-container">

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

          {message && <p>{message}</p>}
        </section>

        <section className="complaint-list-card">
          <h2>My Complaints</h2>

          {complaints.length === 0 ? (
            <p className="empty-complaints">
              You haven't submitted any complaints yet.
            </p>
          ) : (
            complaints.map((complaint) => (
              <article className="complaint-item" key={complaint.id}>
                <h3>{complaint.category}</h3>

                <p>
                  <strong>Location:</strong> {complaint.location}
                </p>

                <p>
                  <strong>Description:</strong> {complaint.description}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(complaint.created_at).toLocaleDateString()}
                </p>

                <span className="complaint-status">
                  Status: {complaint.status}
                </span>
              </article>
            ))
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
