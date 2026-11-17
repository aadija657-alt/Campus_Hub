
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function StudentServices() {
  const [selectedService, setSelectedService] = useState("");
  const [requests, setRequests] = useState([]);
  const [room, setRoom] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("campushubToken");

  const services = [
    {
      icon: "🧹",
      title: "Cleaning Services",
      description: "Room cleaning and housekeeping.",
      issues: ["Room Cleaning", "Bathroom Cleaning", "Common Area Cleaning", "Other"]
    },
    {
      icon: "🔧",
      title: "Maintenance Services",
      description: "Electrical, plumbing and furniture repairs.",
      issues: ["Electrical Problem", "Plumbing Problem", "Furniture Damage", "Other"]
    },
    {
      icon: "🚰",
      title: "Water Services",
      description: "Drinking water and water supply assistance.",
      issues: ["Water Supply Problem", "Water Leakage", "Drinking Water", "Other"]
    },
    {
      icon: "📶",
      title: "Wi-Fi Support",
      description: "Internet and connectivity assistance.",
      issues: ["Wi-Fi Not Working", "Slow Internet", "Connection Problem", "Other"]
    },
    {
      icon: "🧺",
      title: "Laundry Services",
      description: "Laundry, washing and ironing assistance.",
      issues: ["Clothes Washing", "Ironing", "Laundry Pickup", "Other"]
    },
    {
      icon: "🆘",
      title: "General Help",
      description: "Get assistance with everyday student needs.",
      issues: ["General Enquiry", "Accommodation Help", "Other Assistance"]
    }
  ];

  const currentService = services.find(
    (service) => service.title === selectedService
  );

  async function loadRequests() {
    if (!token) {
      setError("Please log in to view your service requests.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/service-requests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests.");
      }

      setRequests(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function submitRequest(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Please log in before submitting a request.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          service_name: selectedService,
          room_number: room,
          issue,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request submission failed.");
      }

      setMessage("Your service request has been submitted successfully!");
      setRoom("");
      setIssue("");
      setDescription("");
      setSelectedService("");

      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    maxWidth: "450px",
    padding: "13px",
    marginBottom: "15px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box"
  };

  return (
    <div className="module-page">
      <h1>🛎️ Student Services</h1>
      <p>Select a service to submit your request.</p>

      <div className="module-grid">
        {services.map((service) => (
          <button
            key={service.title}
            type="button"
            onClick={() => {
              setSelectedService(service.title);
              setIssue("");
              setMessage("");
              setError("");
            }}
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              padding: "25px",
              borderRadius: "12px",
              border: selectedService === service.title
                ? "2px solid #2563eb"
                : "1px solid #dddddd",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 5px 15px rgba(0,0,0,0.06)"
            }}
          >
            <h2 style={{ color: "#0f172a" }}>
              {service.icon} {service.title}
            </h2>

            <p style={{ color: "#64748b" }}>
              {service.description}
            </p>

            <strong style={{ color: "#2563eb" }}>
              Select Service →
            </strong>
          </button>
        ))}
      </div>

      {currentService && (
        <div
          className="module-card"
          style={{
            marginTop: "30px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            padding: "25px"
          }}
        >
          <h2>
            {currentService.icon} {currentService.title} Request
          </h2>

          <p>Fill in the details below.</p>

          <form onSubmit={submitRequest}>
            <label>Room Number</label>
            <br />

            <input
              style={inputStyle}
              type="text"
              placeholder="Enter your room number"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />

            <br />

            <label>Select Problem / Service</label>
            <br />

            <select
              style={inputStyle}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
            >
              <option value="">Choose an option</option>

              {currentService.issues.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <br />

            <label>Describe Your Requirement</label>
            <br />

            <textarea
              style={{ ...inputStyle, minHeight: "110px" }}
              placeholder="Explain your problem or requirement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <br />

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "13px 22px",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "30px" }}>
        <h2>📋 My Service Requests</h2>

        {loading ? (
          <p>Loading your requests...</p>
        ) : requests.length === 0 ? (
          <p>No service requests submitted yet.</p>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="module-card"
              style={{
                backgroundColor: "#ffffff",
                color: "#0f172a",
                marginBottom: "15px",
                padding: "20px"
              }}
            >
              <h3>{request.service_name}</h3>
              <p><strong>Room:</strong> {request.room_number}</p>
              <p><strong>Issue:</strong> {request.issue}</p>
              <p><strong>Description:</strong> {request.description}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <br />
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default StudentServices;
