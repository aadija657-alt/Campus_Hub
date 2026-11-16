function Hostel() {
  return (
    <div className="module-page">
      <h1>🏠 Hostel</h1>
      <p>Find and manage hostel information.</p>

      <div className="module-grid">
        <div className="module-card">
          <h2>Sunrise Hostel</h2>
          <p>📍 Near Coaching Area</p>
          <p>🛏️ 2 & 3 Sharing Rooms</p>
          <p>💰 ₹8,000 / Month</p>
          <p>📶 Wi-Fi • AC • Laundry</p>
          <button>View Details</button>
        </div>

        <div className="module-card">
          <h2>Shree Residency</h2>
          <p>📍 Landmark City</p>
          <p>🛏️ Single & 2 Sharing Rooms</p>
          <p>💰 ₹10,000 / Month</p>
          <p>📶 Wi-Fi • Mess • Security</p>
          <button>View Details</button>
        </div>

        <div className="module-card">
          <h2>Student Stay</h2>
          <p>📍 Rajeev Gandhi Nagar</p>
          <p>🛏️ 2 & 3 Sharing Rooms</p>
          <p>💰 ₹7,500 / Month</p>
          <p>📶 Wi-Fi • Mess • CCTV</p>
          <button>View Details</button>
        </div>
      </div>
    </div>
  );
}

export default Hostel;