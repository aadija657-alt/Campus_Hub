
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Gym() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/gym")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load gyms");
        }
        return response.json();
      })
      .then((data) => {
        setGyms(data.gym || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not connect to the server.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "30px",
      fontFamily: "Arial"
    }}>

      <Link to="/dashboard" style={{
        textDecoration: "none",
        color: "#2563eb"
      }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ color: "#0f172a", marginTop: "25px" }}>
        Find Your Gym
      </h1>

      <p style={{ color: "#64748b" }}>
        Explore gym options and fitness facilities for students in Kota.
      </p>

      {loading && <p>Loading gyms...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px"
        }}>

          {gyms.map((gym) => (
            <div key={gym.id} style={{
              background: "white",
              padding: "22px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
            }}>

              <h2 style={{ color: "#0f172a" }}>
                {gym.name}
              </h2>

              <p>📍 {gym.location}</p>

              <h2 style={{ color: "#2563eb" }}>
                ₹{Number(gym.membership_price).toLocaleString("en-IN")} / month
              </h2>

              <p>
                🏋️ <strong>Facilities:</strong> {gym.facilities}
              </p>

              <p>🕐 Timings: {gym.timings}</p>

            </div>
          ))}

        </div>
      )}

      {!loading && !error && gyms.length === 0 && (
        <p>No gyms found.</p>
      )}

    </div>
  );
}

export default Gym;
