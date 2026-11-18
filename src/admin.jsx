
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";

function Admin() {
  const navigate = useNavigate();

  const admin = JSON.parse(
    localStorage.getItem("campushubStudent") || "{}"
  );
  const token = localStorage.getItem("campushubToken");

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [messList, setMessList] = useState([]);
  const [gymList, setGymList] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [overview, setOverview] = useState({
  students: 0,
  hostels: 0,
  mess: 0,
  gyms: 0,
  complaints: 0,
  pendingComplaints: 0,
  serviceRequests: 0,
  pendingRequests: 0,
  recentStudents: []
});

const [overviewLoading, setOverviewLoading] = useState(true);

useEffect(() => {
  async function loadOverview() {
    if (!token) {
      setOverviewLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        studentsRes,
        complaintsRes,
        requestsRes,
        hostelsRes,
        messRes,
        gymRes
      ] = await Promise.all([
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/students", { headers }),
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/complaints", { headers }),
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/service-requests", { headers }),
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/hostels", { headers }),
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/mess", { headers }),
        fetch("https://campushub-production-5af35267.up.railway.app/api/admin/gym", { headers })
      ]);

      const [
        studentsData,
        complaintsData,
        requestsData,
        hostelsData,
        messData,
        gymData
      ] = await Promise.all([
        studentsRes.json(),
        complaintsRes.json(),
        requestsRes.json(),
        hostelsRes.json(),
        messRes.json(),
        gymRes.json()
      ]);

      if (
        !studentsRes.ok ||
        !complaintsRes.ok ||
        !requestsRes.ok ||
        !hostelsRes.ok ||
        !messRes.ok ||
        !gymRes.ok
      ) {
        throw new Error("Unable to load dashboard statistics.");
      }

      const studentList = studentsData.students || [];
      const complaintList = complaintsData.complaints || [];
      const requestList = Array.isArray(requestsData) ? requestsData : [];

      setOverview({
        students: studentList.length,
        hostels: (hostelsData.hostels || []).length,
        mess: (messData.mess || []).length,
        gyms: (gymData.gym || []).length,
        complaints: complaintList.length,
        pendingComplaints: complaintList.filter(
          item => item.status !== "Resolved"
        ).length,
        serviceRequests: requestList.length,
        pendingRequests: requestList.filter(
          item => item.status !== "Resolved"
        ).length,
        recentStudents: studentList.slice(0, 5)
      });

    } catch (error) {
      console.error("Dashboard overview error:", error);
    } finally {
      setOverviewLoading(false);
    }
  }

  loadOverview();
}, [token]);

  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [messEditingId, setMessEditingId] = useState(null);
  const [gymEditingId, setGymEditingId] = useState(null);

  const emptyHostelForm = {
    name: "",
    location: "",
    price: "",
    gender: "Boys",
    rooms_available: "",
    facilities: ""
  };

  const emptyMessForm = {
    name: "",
    location: "",
    food_type: "",
    price: "",
    meal_timings: ""
  };

  const emptyGymForm = {
    name: "",
    location: "",
    membership_price: "",
    facilities: "",
    timings: ""
  };

  const [hostelForm, setHostelForm] = useState(emptyHostelForm);
  const [messForm, setMessForm] = useState(emptyMessForm);
  const [gymForm, setGymForm] = useState(emptyGymForm);

  function handleLogout() {
    localStorage.removeItem("campushubStudent");
    localStorage.removeItem("campushubToken");
    navigate("/login");
  }

  // LOAD STUDENTS
  async function loadStudents() {
    setActiveSection("Students");
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/students",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load students.");
        return;
      }

      setStudents(data.students || []);
      if (!data.students?.length) {
        setMessage("No students registered yet.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  // LOAD COMPLAINTS
  async function loadComplaints() {
    setActiveSection("Complaints");
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/complaints",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load complaints.");
        return;
      }

      setComplaints(data.complaints || []);
      if (!data.complaints?.length) {
        setMessage("No complaints submitted yet.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }
// LOAD STUDENT SERVICE REQUESTS
async function loadServiceRequests() {
  setActiveSection("Service Requests");
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      "https://campushub-production-5af35267.up.railway.app/api/admin/service-requests",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to load service requests.");
      return;
    }

    setServiceRequests(data);

    if (!data.length) {
      setMessage("No student service requests submitted yet.");
    }
  } catch {
    setMessage("Cannot connect to backend server.");
  } finally {
    setLoading(false);
  }
}
// LOAD ACTIVITY LOGS
async function loadActivityLogs() {
  setActiveSection("Activity Logs");
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      "https://campushub-production-5af35267.up.railway.app/api/admin/activity-logs",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to load activity logs.");
      return;
    }

    setActivityLogs(data.logs || []);

    if (!data.logs?.length) {
      setMessage("No activity logs found yet.");
    }
  } catch {
    setMessage("Cannot connect to backend server.");
  } finally {
    setLoading(false);
  }
}
  // LOAD PAYMENTS
  async function loadPayments() {
    setActiveSection("Payments");
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/payments",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load payments.");
        return;
      }

      setPayments(data);

      if (!data.length) {
        setMessage("No payment records found.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  // UPDATE COMPLAINT STATUS
  async function updateStatus(complaintId, status) {
    setUpdatingId(complaintId);
    setMessage("");

    try {
      const response = await fetch(
        `https://campushub-production-5af35267.up.railway.app/api/admin/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not update status.");
        return;
      }

      setComplaints(previous =>
        previous.map(item =>
          item.id === complaintId ? { ...item, status } : item
        )
      );

      setMessage("Complaint status updated successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setUpdatingId(null);
    }
  }
// UPDATE SERVICE REQUEST STATUS
async function updateServiceRequestStatus(requestId, status) {
  setUpdatingId(requestId);
  setMessage("");

  try {
    const response = await fetch(
      `https://campushub-production-5af35267.up.railway.app/api/admin/service-requests/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not update service request.");
      return;
    }

    setServiceRequests(previous =>
      previous.map(item =>
        item.id === requestId ? { ...item, status } : item
      )
    );

    setMessage("Service request status updated successfully!");
  } catch {
    setMessage("Cannot connect to backend server.");
  } finally {
    setUpdatingId(null);
  }
}
  // LOAD HOSTELS
  async function loadHostels() {
    setActiveSection("Hostels");
    setLoading(true);
    setMessage("");
    setEditingId(null);
    setHostelForm(emptyHostelForm);

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/hostels",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load hostels.");
        return;
      }

      setHostels(data.hostels || []);
      if (!data.hostels?.length) {
        setMessage("No hostels added yet.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  function handleHostelChange(e) {
    const { name, value } = e.target;
    setHostelForm(previous => ({ ...previous, [name]: value }));
  }

  // ADD OR UPDATE HOSTEL
  async function saveHostel(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    try {
      const url = editingId
        ? `https://campushub-production-5af35267.up.railway.app/api/admin/hostels/${editingId}`
        : "https://campushub-production-5af35267.up.railway.app/api/admin/hostels";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...hostelForm,
          price: Number(hostelForm.price),
          rooms_available: Number(hostelForm.rooms_available || 0)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save hostel.");
        return;
      }

      setHostelForm(emptyHostelForm);
      setEditingId(null);
      await loadHostels();
      setMessage(data.message || "Hostel saved successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  function editHostel(hostel) {
    setEditingId(hostel.id);
    setHostelForm({
      name: hostel.name,
      location: hostel.location,
      price: hostel.price,
      gender: hostel.gender,
      rooms_available: hostel.rooms_available,
      facilities: hostel.facilities || ""
    });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // DELETE HOSTEL
  async function deleteHostel(id) {
    if (!window.confirm("Are you sure you want to delete this hostel?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `https://campushub-production-5af35267.up.railway.app/api/admin/hostels/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete hostel.");
        return;
      }

      setHostels(previous =>
        previous.filter(hostel => hostel.id !== id)
      );
      setMessage("Hostel deleted successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  // LOAD MESS
  async function loadMess() {
    setActiveSection("Mess");
    setLoading(true);
    setMessage("");
    setMessEditingId(null);
    setMessForm(emptyMessForm);

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/mess",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load mess listings.");
        return;
      }

      setMessList(data.mess || []);

      if (!data.mess?.length) {
        setMessage("No mess listings added yet.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  function handleMessChange(e) {
    const { name, value } = e.target;
    setMessForm(previous => ({ ...previous, [name]: value }));
  }

  // ADD OR UPDATE MESS
  async function saveMess(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    try {
      const url = messEditingId
        ? `https://campushub-production-5af35267.up.railway.app/api/admin/mess/${messEditingId}`
        : "https://campushub-production-5af35267.up.railway.app/api/admin/mess";

      const response = await fetch(url, {
        method: messEditingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...messForm,
          price: Number(messForm.price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save mess.");
        return;
      }

      setMessForm(emptyMessForm);
      setMessEditingId(null);
      await loadMess();
      setMessage(data.message || "Mess saved successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  function editMess(item) {
    setMessEditingId(item.id);
    setMessForm({
      name: item.name,
      location: item.location,
      food_type: item.food_type,
      price: item.price,
      meal_timings: item.meal_timings
    });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // DELETE MESS
  async function deleteMess(id) {
    if (!window.confirm("Are you sure you want to delete this mess listing?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `https://campushub-production-5af35267.up.railway.app/api/admin/mess/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete mess.");
        return;
      }

      setMessList(previous =>
        previous.filter(item => item.id !== id)
      );
      setMessage("Mess deleted successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  // LOAD GYMS
  async function loadGym() {
    setActiveSection("Gym");
    setLoading(true);
    setMessage("");
    setGymEditingId(null);
    setGymForm(emptyGymForm);

    try {
      const response = await fetch(
        "https://campushub-production-5af35267.up.railway.app/api/admin/gym",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load gyms.");
        return;
      }

      setGymList(data.gym || []);

      if (!data.gym?.length) {
        setMessage("No gym listings added yet.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  function handleGymChange(e) {
    const { name, value } = e.target;
    setGymForm(previous => ({ ...previous, [name]: value }));
  }

  // ADD OR UPDATE GYM
  async function saveGym(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    try {
      const url = gymEditingId
        ? `https://campushub-production-5af35267.up.railway.app/api/admin/gym/${gymEditingId}`
        : "https://campushub-production-5af35267.up.railway.app/api/admin/gym";

      const response = await fetch(url, {
        method: gymEditingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...gymForm,
          membership_price: Number(gymForm.membership_price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save gym.");
        return;
      }

      setGymForm(emptyGymForm);
      setGymEditingId(null);
      await loadGym();
      setMessage(data.message || "Gym saved successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

  function editGym(gym) {
    setGymEditingId(gym.id);
    setGymForm({
      name: gym.name,
      location: gym.location,
      membership_price: gym.membership_price,
      facilities: gym.facilities || "",
      timings: gym.timings
    });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // DELETE GYM
  async function deleteGym(id) {
    if (!window.confirm("Are you sure you want to delete this gym?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `https://campushub-production-5af35267.up.railway.app/api/admin/gym/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete gym.");
        return;
      }

      setGymList(previous =>
        previous.filter(gym => gym.id !== id)
      );

      setMessage("Gym deleted successfully!");
    } catch {
      setMessage("Cannot connect to backend server.");
    }
  }

const sections = [
  ["Students", "View registered students"],
  ["Complaints", "View and manage complaints"],
  ["Service Requests", "View and manage student service requests"],
  ["Hostels", "Manage hostel information"],
  ["Mess", "Manage mess information"],
  ["Gym", "Manage gym information"],
  ["Payments", "View student payment records"],
  ["Activity Logs", "Track admin activities and changes"]
];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        background: "#0f172a",
        color: "white",
        padding: "22px 35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ color: "#ffffff" }}>CampusHub Admin</h2>

        <button onClick={handleLogout} style={{
          padding: "10px 18px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </header>

      <main style={{ padding: "35px" }}>
        <h1 style={headingStyle}>
  Welcome, {admin.full_name || "Admin"}!
</h1>
        <p>Manage CampusHub student services from one place.</p>
        {/* ADMIN DASHBOARD OVERVIEW */}
<section style={{ marginTop: "30px" }}>
  <h2 style={{ color: "#0f172a" }}>Dashboard Overview</h2>
  <p style={{ color: "#64748b" }}>
    Live summary of CampusHub activities.
  </p>

  {overviewLoading ? (
    <p>Loading dashboard statistics...</p>
  ) : (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "18px",
        marginTop: "20px"
      }}>
        {[
          ["Total Students", overview.students, "#2563eb"],
          ["Hostels", overview.hostels, "#7c3aed"],
          ["Mess Listings", overview.mess, "#0891b2"],
          ["Gyms", overview.gyms, "#059669"],
          ["Total Complaints", overview.complaints, "#d97706"],
          ["Pending Complaints", overview.pendingComplaints, "#dc2626"],
          ["Service Requests", overview.serviceRequests, "#4f46e5"],
          ["Pending Requests", overview.pendingRequests, "#ea580c"]
        ].map(([title, value, color]) => (
          <div key={title} style={{
            background: "white",
            padding: "22px",
            borderRadius: "12px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
            borderLeft: `5px solid ${color}`
          }}>
            <p style={{ color: "#64748b", margin: 0 }}>{title}</p>
            <h1 style={{
              color,
              fontSize: "32px",
              margin: "12px 0 0"
            }}>
              {value}
            </h1>
          </div>
        ))}
      </div>

      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        marginTop: "25px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
      }}>
        <h2 style={{ color: "#0f172a" }}>
          Recent Student Registrations
        </h2>

        {overview.recentStudents.length === 0 ? (
          <p>No student registrations found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  {["ID", "Name", "Email", "Phone", "Role"].map(item => (
                    <th key={item} style={cellStyle}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overview.recentStudents.map(student => (
                  <tr key={student.id}>
                    <td style={cellStyle}>{student.id}</td>
                    <td style={cellStyle}>{student.full_name}</td>
                    <td style={cellStyle}>{student.email}</td>
                    <td style={cellStyle}>{student.phone || "-"}</td>
                    <td style={cellStyle}>{student.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}
</section>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          {sections.map(([title, description]) => (
            <div
  key={title}
  style={{
    ...cardStyle,
    backgroundColor: "#ffffff",
    color: "#0f172a"
  }}
>
  <h2 style={{ color: "#0f172a" }}>{title}</h2>

  <p style={{ color: "#475569" }}>{description}</p>

  <button
    onClick={() => {
      if (title === "Students") loadStudents();
      else if (title === "Complaints") loadComplaints();
      else if (title === "Hostels") loadHostels();
      else if (title === "Mess") loadMess();
      else if (title === "Gym") loadGym();
      else if (title === "Service Requests") loadServiceRequests();
      else if (title === "Payments") loadPayments();
      else if (title === "Activity Logs") loadActivityLogs();
    }}
    style={buttonStyle}
  >
    Manage
  </button>
</div>
          ))}
        </div>

        {/* STUDENTS */}
        {activeSection === "Students" && (
          <section style={sectionStyle}>
            <h2>Registered Students</h2>
            {loading && <p>Loading students...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            {!loading && students.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {["ID", "Name", "Email", "Phone", "Role", "Registered On"].map(heading => (
                        <th key={heading} style={cellStyle}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td style={cellStyle}>{student.id}</td>
                        <td style={cellStyle}>{student.full_name}</td>
                        <td style={cellStyle}>{student.email}</td>
                        <td style={cellStyle}>{student.phone || "-"}</td>
                        <td style={cellStyle}>{student.role}</td>
                        <td style={cellStyle}>
                          {student.created_at
                            ? new Date(student.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* COMPLAINTS */}
        {activeSection === "Complaints" && (
          <section style={sectionStyle}>
            <h2>Manage Student Complaints</h2>
            {loading && <p>Loading complaints...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            {!loading && complaints.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {["ID", "Student", "Email", "Category", "Location", "Description", "Date", "Status"].map(heading => (
                        <th key={heading} style={cellStyle}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(complaint => (
                      <tr key={complaint.id}>
                        <td style={cellStyle}>{complaint.id}</td>
                        <td style={cellStyle}>{complaint.student_name}</td>
                        <td style={cellStyle}>{complaint.student_email}</td>
                        <td style={cellStyle}>{complaint.category}</td>
                        <td style={cellStyle}>{complaint.location}</td>
                        <td style={{ ...cellStyle, minWidth: "200px" }}>
                          {complaint.description}
                        </td>
                        <td style={cellStyle}>
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                        <td style={cellStyle}>
                          <select
                            value={complaint.status}
                            disabled={updatingId === complaint.id}
                            onChange={e => updateStatus(complaint.id, e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px" }}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          {updatingId === complaint.id && <p>Updating...</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

{/* STUDENT SERVICE REQUESTS */}
{activeSection === "Service Requests" && (
  <section style={sectionStyle}>
    <h2>Manage Student Service Requests</h2>

    {loading && <p>Loading service requests...</p>}

    {message && <p style={messageStyle}>{message}</p>}

    {!loading && serviceRequests.length > 0 && (
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              {[
                "ID",
                "Student",
                "Email",
                "Service",
                "Room",
                "Issue",
                "Description",
                "Date",
                "Status"
              ].map(heading => (
                <th key={heading} style={cellStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {serviceRequests.map(request => (
              <tr key={request.id}>
                <td style={cellStyle}>{request.id}</td>
                <td style={cellStyle}>{request.full_name}</td>
                <td style={cellStyle}>{request.email}</td>
                <td style={cellStyle}>{request.service_name}</td>
                <td style={cellStyle}>{request.room_number}</td>
                <td style={cellStyle}>{request.issue}</td>

                <td style={{ ...cellStyle, minWidth: "180px" }}>
                  {request.description}
                </td>

                <td style={cellStyle}>
                  {new Date(request.created_at).toLocaleDateString()}
                </td>

                <td style={cellStyle}>
                  <select
                    value={request.status}
                    disabled={updatingId === request.id}
                    onChange={e =>
                      updateServiceRequestStatus(
                        request.id,
                        e.target.value
                      )
                    }
                    style={{
                      padding: "8px",
                      borderRadius: "6px"
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  {updatingId === request.id && (
                    <p>Updating...</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

        {/* PAYMENTS MANAGEMENT */}
        {activeSection === "Payments" && (
          <section style={sectionStyle}>
            <h2>Student Payment Records</h2>

            {loading && <p>Loading payments...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            {!loading && payments.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {[
                        "ID",
                        "Student",
                        "Email",
                        "Payment",
                        "Amount",
                        "Status",
                        "Date"
                      ].map(heading => (
                        <th key={heading} style={cellStyle}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td style={cellStyle}>{payment.id}</td>
                        <td style={cellStyle}>{payment.full_name}</td>
                        <td style={cellStyle}>{payment.email}</td>
                        <td style={cellStyle}>{payment.title}</td>
                        <td style={cellStyle}>
                          ₹{Number(payment.amount).toLocaleString("en-IN")}
                        </td>
                        <td style={cellStyle}>
                          {payment.status}
                        </td>
                        <td style={cellStyle}>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {/* ACTIVITY LOGS */}
{activeSection === "Activity Logs" && (
  <section style={sectionStyle}>
    <h2>Admin Activity Logs</h2>

    {loading && <p>Loading activity logs...</p>}

    {message && <p style={messageStyle}>{message}</p>}

    {!loading && activityLogs.length > 0 && (
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              {["ID", "Admin", "Action", "Details", "Date & Time"].map(
                heading => (
                  <th key={heading} style={cellStyle}>
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {activityLogs.map(log => (
              <tr key={log.id}>
                <td style={cellStyle}>{log.id}</td>
                <td style={cellStyle}>{log.admin_name || "Admin"}</td>
                <td style={cellStyle}>{log.action}</td>
                <td style={cellStyle}>{log.details}</td>
                <td style={cellStyle}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

        {/* HOSTEL MANAGEMENT */}
        {activeSection === "Hostels" && (
          <section style={sectionStyle}>
            <h2>Hostel Management</h2>
            {loading && <p>Loading hostels...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            <h3>{editingId ? "Edit Hostel" : "Add New Hostel"}</h3>

            <form onSubmit={saveHostel} style={formGridStyle}>
              <input name="name" placeholder="Hostel Name" value={hostelForm.name} onChange={handleHostelChange} required style={inputStyle} />
              <input name="location" placeholder="Location" value={hostelForm.location} onChange={handleHostelChange} required style={inputStyle} />
              <input name="price" type="number" min="1" placeholder="Monthly Price" value={hostelForm.price} onChange={handleHostelChange} required style={inputStyle} />

              <select name="gender" value={hostelForm.gender} onChange={handleHostelChange} style={inputStyle}>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </select>

              <input name="rooms_available" type="number" min="0" placeholder="Available Rooms" value={hostelForm.rooms_available} onChange={handleHostelChange} style={inputStyle} />
              <input name="facilities" placeholder="Facilities" value={hostelForm.facilities} onChange={handleHostelChange} style={inputStyle} />

              <button type="submit" style={buttonStyle}>
                {editingId ? "Update Hostel" : "Add Hostel"}
              </button>

              {editingId && (
                <button type="button" onClick={() => {
                  setEditingId(null);
                  setHostelForm(emptyHostelForm);
                  setMessage("");
                }} style={{ ...buttonStyle, background: "#64748b" }}>
                  Cancel Edit
                </button>
              )}
            </form>

            <h3>All Hostels</h3>

            {!loading && hostels.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {["ID", "Name", "Location", "Price", "Gender", "Rooms", "Facilities", "Actions"].map(heading => (
                        <th key={heading} style={cellStyle}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hostels.map(hostel => (
                      <tr key={hostel.id}>
                        <td style={cellStyle}>{hostel.id}</td>
                        <td style={cellStyle}>{hostel.name}</td>
                        <td style={cellStyle}>{hostel.location}</td>
                        <td style={cellStyle}>₹{hostel.price}</td>
                        <td style={cellStyle}>{hostel.gender}</td>
                        <td style={cellStyle}>{hostel.rooms_available}</td>
                        <td style={cellStyle}>{hostel.facilities}</td>
                        <td style={cellStyle}>
                          <button onClick={() => editHostel(hostel)} style={{ ...buttonStyle, marginBottom: "6px" }}>Edit</button>
                          <button onClick={() => deleteHostel(hostel.id)} style={{ ...buttonStyle, background: "#dc2626" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && hostels.length === 0 && (
              <p>No hostels available. Add your first hostel above.</p>
            )}
          </section>
        )}

        {/* MESS MANAGEMENT */}
        {activeSection === "Mess" && (
          <section style={sectionStyle}>
            <h2>Mess Management</h2>
            {loading && <p>Loading mess listings...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            <h3>{messEditingId ? "Edit Mess" : "Add New Mess"}</h3>

            <form onSubmit={saveMess} style={formGridStyle}>
              <input name="name" placeholder="Mess Name" value={messForm.name} onChange={handleMessChange} required style={inputStyle} />
              <input name="location" placeholder="Location" value={messForm.location} onChange={handleMessChange} required style={inputStyle} />
              <input name="food_type" placeholder="Food Type (e.g. Vegetarian)" value={messForm.food_type} onChange={handleMessChange} required style={inputStyle} />
              <input name="price" type="number" min="1" placeholder="Monthly Price" value={messForm.price} onChange={handleMessChange} required style={inputStyle} />
              <input name="meal_timings" placeholder="Meal Timings" value={messForm.meal_timings} onChange={handleMessChange} required style={inputStyle} />

              <button type="submit" style={buttonStyle}>
                {messEditingId ? "Update Mess" : "Add Mess"}
              </button>

              {messEditingId && (
                <button type="button" onClick={() => {
                  setMessEditingId(null);
                  setMessForm(emptyMessForm);
                  setMessage("");
                }} style={{ ...buttonStyle, background: "#64748b" }}>
                  Cancel Edit
                </button>
              )}
            </form>

            <h3>All Mess Listings</h3>

            {!loading && messList.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {["ID", "Name", "Location", "Food Type", "Price", "Meal Timings", "Actions"].map(heading => (
                        <th key={heading} style={cellStyle}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {messList.map(item => (
                      <tr key={item.id}>
                        <td style={cellStyle}>{item.id}</td>
                        <td style={cellStyle}>{item.name}</td>
                        <td style={cellStyle}>{item.location}</td>
                        <td style={cellStyle}>{item.food_type}</td>
                        <td style={cellStyle}>₹{item.price}</td>
                        <td style={cellStyle}>{item.meal_timings}</td>
                        <td style={cellStyle}>
                          <button onClick={() => editMess(item)} style={{ ...buttonStyle, marginBottom: "6px" }}>Edit</button>
                          <button onClick={() => deleteMess(item.id)} style={{ ...buttonStyle, background: "#dc2626" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && messList.length === 0 && (
              <p>No mess listings available. Add your first mess above.</p>
            )}
          </section>
        )}

        {/* GYM MANAGEMENT */}
        {activeSection === "Gym" && (
          <section style={sectionStyle}>
            <h2>Gym Management</h2>
            {loading && <p>Loading gym listings...</p>}
            {message && <p style={messageStyle}>{message}</p>}

            <h3>{gymEditingId ? "Edit Gym" : "Add New Gym"}</h3>

            <form onSubmit={saveGym} style={formGridStyle}>
              <input
                name="name"
                placeholder="Gym Name"
                value={gymForm.name}
                onChange={handleGymChange}
                required
                style={inputStyle}
              />

              <input
                name="location"
                placeholder="Location"
                value={gymForm.location}
                onChange={handleGymChange}
                required
                style={inputStyle}
              />

              <input
                name="membership_price"
                type="number"
                min="1"
                placeholder="Monthly Membership Price"
                value={gymForm.membership_price}
                onChange={handleGymChange}
                required
                style={inputStyle}
              />

              <input
                name="facilities"
                placeholder="Facilities"
                value={gymForm.facilities}
                onChange={handleGymChange}
                style={inputStyle}
              />

              <input
                name="timings"
                placeholder="Gym Timings"
                value={gymForm.timings}
                onChange={handleGymChange}
                required
                style={inputStyle}
              />

              <button type="submit" style={buttonStyle}>
                {gymEditingId ? "Update Gym" : "Add Gym"}
              </button>

              {gymEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setGymEditingId(null);
                    setGymForm(emptyGymForm);
                    setMessage("");
                  }}
                  style={{ ...buttonStyle, background: "#64748b" }}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <h3>All Gym Listings</h3>

            {!loading && gymList.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={headerRowStyle}>
                      {["ID", "Name", "Location", "Membership Price", "Facilities", "Timings", "Actions"].map(heading => (
                        <th key={heading} style={cellStyle}>{heading}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {gymList.map(gym => (
                      <tr key={gym.id}>
                        <td style={cellStyle}>{gym.id}</td>
                        <td style={cellStyle}>{gym.name}</td>
                        <td style={cellStyle}>{gym.location}</td>
                        <td style={cellStyle}>₹{gym.membership_price}</td>
                        <td style={cellStyle}>{gym.facilities || "-"}</td>
                        <td style={cellStyle}>{gym.timings}</td>
                        <td style={cellStyle}>
                          <button
                            onClick={() => editGym(gym)}
                            style={{ ...buttonStyle, marginBottom: "6px" }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteGym(gym.id)}
                            style={{ ...buttonStyle, background: "#dc2626" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && gymList.length === 0 && (
              <p>No gym listings available. Add your first gym above.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  color: "#0f172a",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
};

const sectionStyle = {
  background: "#ffffff",
  color: "#0f172a",
  padding: "25px",
  marginTop: "35px",
  borderRadius: "12px",
  overflowX: "auto"
};
const headingStyle = {
  color: "#0f172a"
};

const paragraphStyle = {
  color: "#475569"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "30px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const headerRowStyle = {
  background: "#e2e8f0"
};

const cellStyle = {
  border: "1px solid #cbd5e1",
  padding: "12px",
  textAlign: "left",
  verticalAlign: "top"
};

const messageStyle = {
  color: "#2563eb",
  fontWeight: "bold"
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer"
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  width: "100%",
  boxSizing: "border-box"
};

export default Admin;
