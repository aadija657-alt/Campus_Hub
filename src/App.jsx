
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Admin from "admin";
import Hostel from "./Hostel";
import Mess from "./Mess";
import Gym from "./Gym";
import Complaints from "./Complaints";

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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/hostel" element={<Hostel />} />
      <Route path="/mess" element={<Mess />} />
      <Route path="/gym" element={<Gym />} />
      <Route path="/complaints" element={<Complaints />} />
    </Routes>
  );
}

export default App;
