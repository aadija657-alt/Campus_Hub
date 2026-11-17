
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Mess() {
  const [messList, setMessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/mess")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load mess listings");
        }
        return response.json();
      })
      .then((data) => {
        setMessList(data.mess || []);
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

      <h1 style={{
        color: "#0f172a",
        marginTop: "25px"
      }}>
        Find Your Mess
      </h1>

      <p style={{ color: "#64748b" }}>
        Explore food and meal options for students in Kota.
      </p>

      {loading && <p>Loading mess listings...</p>}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {!loading && !error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginTop: "25px"
        }}>

          {messList.map((mess) => (
            <div key={mess.id} style={{
              background: "white",
              padding: "22px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
            }}>

              <h2 style={{ color: "#0f172a" }}>
                {mess.name}
              </h2>

              <p>📍 {mess.location}</p>

              <p>🍛 {mess.food_type}</p>

              <h2 style={{ color: "#2563eb" }}>
                ₹{Number(mess.price).toLocaleString("en-IN")} / month
              </h2>

              <p>🕐 {mess.meal_timings}</p>

            </div>
          ))}

        </div>
      )}

      {!loading && !error && messList.length === 0 && (
        <p>No mess listings available.</p>
      )}

    </div>
  );
}

export default Mess;
