
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const studentData = localStorage.getItem("campushubStudent");
  const student = studentData ? JSON.parse(studentData) : null;

  function handleLogout() {
    localStorage.removeItem("campushubStudent");
    navigate("/login");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "30px",
      fontFamily: "Arial, sans-serif"
    }}>

      {/* Header */}
      <header style={{
        background: "#0f172a",
        color: "white",
        padding: "22px 30px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div>
          <h1>CampusHub</h1>
          <p>Your Student Services Dashboard</p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "12px 22px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </header>

      {/* Welcome Section */}
      <section style={{ marginTop: "35px" }}>
        <h2>
          Welcome, {student?.full_name || "Student"} 👋
        </h2>

        <p>
          Access accommodation and daily student services in one place.
        </p>

        {student && (
          <div style={{
            background: "white",
            padding: "18px",
            borderRadius: "12px",
            marginTop: "20px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
          }}>
            <h3>Student Profile</h3>
            <p><strong>Name:</strong> {student.full_name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Student ID:</strong> {student.id}</p>
          </div>
        )}
      </section>
<div style={{ marginTop: "25px" }}>
  <Link to="/profile" style={{ textDecoration: "none" }}>
    <button style={{
      padding: "13px 25px",
      background: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold"
    }}>
      👤 My Profile
    </button>
  </Link>
</div>
      {/* Services */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "22px",
        marginTop: "28px"
      }}>

        <ServiceCard
          icon="🏠"
          title="Hostel Information"
          description="Explore hostel details, facilities and contact information."
          link="/hostel"
          buttonText="Explore Hostels"
        />

        <ServiceCard
          icon="🍽️"
          title="Mess Information"
          description="View mess charges, meal timings and available services."
          link="/mess"
          buttonText="View Mess"
        />

        <ServiceCard
          icon="🏋️"
          title="Gym Information"
          description="Explore gym facilities, timings and membership details."
          link="/gym"
          buttonText="Explore Gyms"
        />

        <ServiceCard
          icon="📝"
          title="Complaint Management"
          description="Submit complaints about maintenance, food and other issues."
          link="/complaints"
          buttonText="Manage Complaints"
        />
        <ServiceCard
  icon="💳"
  title="Payments"
  description="View hostel, mess and gym payment details."
  link="/payments"
  buttonText="View Payments"
/>
<ServiceCard
  icon="🛎️"
  title="Student Services"
  description="Explore cleaning, maintenance, laundry and other daily services."
  link="/student-services"
  buttonText="Explore Services"
/>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        marginTop: "45px",
        color: "#64748b"
      }}>
        <p>CampusHub © 2026 | Student Services in Kota</p>
      </footer>

    </div>
  );
}

function ServiceCard({ icon, title, description, link, buttonText }) {
  return (
    <div style={{
      background: "white",
      padding: "26px",
      borderRadius: "14px",
      boxShadow: "0 5px 20px rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{
  fontSize: "40px",
  marginBottom: "12px"
}}>
  {icon}
</div>
      <h3>{title}</h3>

      <p style={{
        color: "#64748b",
        lineHeight: "1.6",
        flexGrow: 1
      }}>
        {description}
      </p>

      <Link to={link} style={{ textDecoration: "none" }}>
        <button style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          {buttonText}
        </button>
      </Link>
    </div>
  );
}

export default Dashboard;
