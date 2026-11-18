
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Admin from "./admin";
import Hostel from "./Hostel";
import Mess from "./Mess";
import Gym from "./gym";
import Complaints from "./complaints";
import Payments from "./Payments";
import StudentServices from "./StudentServices";
import Profile from "./profile";

// Protect pages that require login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("campushubToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Home() {
  return (
    <div className="container">
      <nav className="navbar">
        <h2>CampusHub</h2>

        <div>
          <Link to="/login">
            <button className="login">Login</button>
          </Link>

          <Link to="/register">
            <button className="signup">Sign Up</button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <h1>CampusHub</h1>
        <p>
          Your one platform for hostel, mess, gym and daily
          student services in Kota.
        </p>

        <Link to="/dashboard">
          <button className="start-btn">Get Started</button>
        </Link>
      </section>

      <div className="features">
        <div className="card">
          <h2>🏠 Hostel</h2>
          <p>View hostel details, facilities and contact information.</p>
        </div>

        <div className="card">
          <h2>🍽️ Mess</h2>
          <p>Find mess information, charges and meal timings.</p>
        </div>

        <div className="card">
          <h2>🏋️ Gym</h2>
          <p>View gym facilities, timings and membership information.</p>
        </div>

        <div className="card">
          <h2>📝 Complaints</h2>
          <p>Register and track maintenance and service complaints.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/hostel" element={<ProtectedRoute><Hostel /></ProtectedRoute>} />
      <Route path="/mess" element={<ProtectedRoute><Mess /></ProtectedRoute>} />
      <Route path="/gym" element={<ProtectedRoute><Gym /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/student-services" element={<ProtectedRoute><StudentServices /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
