
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Hostel() {
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/hostels")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load hostels");
        }
        return response.json();
      })
      .then((data) => {
        setHostels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not connect to the server.");
        setLoading(false);
      });
  }, []);

  const filteredHostels = hostels.filter((hostel) => {
    const matchesSearch =
      hostel.name.toLowerCase().includes(search.toLowerCase()) ||
      hostel.location.toLowerCase().includes(search.toLowerCase());

    const matchesGender =
      gender === "All" || hostel.gender === gender;

    return matchesSearch && matchesGender;
  });

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
        Find Your Hostel
      </h1>

      <p style={{ color: "#64748b" }}>
        Explore accommodation options for students in Kota.
      </p>

      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        margin: "25px 0"
      }}>
        <input
          type="text"
          placeholder="Search by hostel or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            width: "280px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px"
          }}
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={{
            padding: "12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px"
          }}
        >
          <option value="All">All Hostels</option>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>
      </div>

      {loading && <p>Loading hostels...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px"
        }}>
          {filteredHostels.map((hostel) => (
            <div key={hostel.id} style={{
              background: "white",
              padding: "22px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
            }}>
              <h2 style={{ color: "#0f172a" }}>
                {hostel.name}
              </h2>

              <p>📍 {hostel.location}</p>
              <p>👥 {hostel.gender} Hostel</p>

              <h2 style={{ color: "#2563eb" }}>
                ₹{Number(hostel.price).toLocaleString("en-IN")} / month
              </h2>

              <p>🛏️ {hostel.rooms_available} Rooms Available</p>

              <p>
                <strong>Facilities:</strong> {hostel.facilities}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredHostels.length === 0 && (
        <p>No hostels found. Try another search.</p>
      )}
    </div>
  );
}

export default Hostel;
