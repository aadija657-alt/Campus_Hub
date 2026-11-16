import { Link } from "react-router-dom";

function Gym() {
  return (
    <div className="gym-page">

      <h1>🏋️ CampusHub Gym Services</h1>

      <p className="gym-intro">
        Find nearby gyms with membership fees, timings, facilities and contact details.
      </p>

      <div className="gym-container">

        <div className="gym-card">
          <h2>Fitness Zone</h2>

          <p>📍 Location: Near Landmark City</p>
          <p>💰 Fee: ₹1,500 / Month</p>
          <p>🕐 Timing: 6:00 AM - 10:00 PM</p>
          <p>🏋️ Facilities: Cardio, Weights, Trainer</p>
          <p>📞 Contact: 98765 43210</p>

          <button>View Details</button>
        </div>


        <div className="gym-card">
          <h2>Student Fitness Club</h2>

          <p>📍 Location: Rajeev Gandhi Nagar</p>
          <p>💰 Fee: ₹1,200 / Month</p>
          <p>🕐 Timing: 5:30 AM - 10:00 PM</p>
          <p>🏋️ Facilities: Weights, Cardio, Steam</p>
          <p>📞 Contact: 98765 12345</p>

          <button>View Details</button>
        </div>


        <div className="gym-card">
          <h2>Power Gym</h2>

          <p>📍 Location: Talwandi</p>
          <p>💰 Fee: ₹1,800 / Month</p>
          <p>🕐 Timing: 6:00 AM - 11:00 PM</p>
          <p>🏋️ Facilities: CrossFit, Weights, Trainer</p>
          <p>📞 Contact: 98765 67890</p>

          <button>View Details</button>
        </div>

      </div>

      <Link to="/dashboard">
        <button className="back-btn">
          Back to Dashboard
        </button>
      </Link>

    </div>
  );
}

export default Gym;