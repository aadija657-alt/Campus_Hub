
import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config({ path: "src/backend/.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
});
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://shimmering-enthusiasm-production-00eeabae.up.railway.app"
  ]
}));
app.use(express.json());
async function logActivity(adminId, action, details) {
  try {
    await db.execute(
      `INSERT INTO activity_logs (admin_id, action, details)
       VALUES (?, ?, ?)`,
      [adminId, action, details]
    );
  } catch (error) {
    console.error("Activity log error:", error);
  }
}
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from your .env file.");
}

// VERIFY LOGIN TOKEN
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute(
      "SELECT id, role FROM students WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Account not found."
      });
    }

    req.user = rows[0];
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login. Please log in again."
    });
  }
}

// ADMIN ACCESS ONLY
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only."
    });
  }

  next();
}

// HOME
app.get("/", (req, res) => {
  res.send("CampusHub Backend is running!");
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusHub API is working!"
  });
});

// DATABASE TEST
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name"
    );

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      database: rows[0].database_name
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not connect to MySQL."
    });
  }
});

// STUDENT REGISTRATION
app.post("/api/register", async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name and email."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO students
       (full_name, email, phone, password)
       VALUES (?, ?, ?, ?)`,
      [
        cleanName,
        cleanEmail,
        phone ? phone.trim() : null,
        hashedPassword
      ]
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully!",
      studentId: result.insertId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Registration failed."
    });
  }
});

// STUDENT AND ADMIN LOGIN
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await db.execute(
      `SELECT id, full_name, email, password, role
       FROM students
       WHERE email = ?`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const student = rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { id: student.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      student: {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        role: student.role
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed."
    });
  }
});

// ADMIN: GET ALL REGISTERED STUDENTS
app.get(
  "/api/admin/students",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [students] = await db.execute(
        `SELECT id, full_name, email, phone, role, created_at
         FROM students
         ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        students
      });

    } catch (error) {
      console.error("Admin students error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not fetch students."
      });
    }
  }
);

// ADMIN: GET ALL COMPLAINTS
app.get(
  "/api/admin/complaints",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [complaints] = await db.execute(
        `SELECT
           complaints.id,
           complaints.student_id,
           students.full_name AS student_name,
           students.email AS student_email,
           complaints.category,
           complaints.location,
           complaints.description,
           complaints.status,
           complaints.created_at
         FROM complaints
         INNER JOIN students
           ON complaints.student_id = students.id
         ORDER BY complaints.created_at DESC`
      );

      res.json({
        success: true,
        complaints
      });

    } catch (error) {
      console.error("Admin complaints error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not fetch complaints."
      });
    }
  }
);
// ADMIN: UPDATE COMPLAINT STATUS
app.patch(
  "/api/admin/complaints/:id/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const complaintId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "Submitted",
        "Pending",
        "In Progress",
        "Resolved"
      ];

      if (
        !Number.isInteger(complaintId) ||
        complaintId <= 0 ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint ID or status."
        });
      }

      const [result] = await db.execute(
        "UPDATE complaints SET status = ? WHERE id = ?",
        [status, complaintId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found."
        });
      }

      await logActivity(
        req.user.id,
        "Complaint Updated",
        `Complaint #${complaintId} status changed to ${status}`
      );

      res.json({
        success: true,
        message: "Complaint status updated successfully!"
      });

    } catch (error) {
      console.error("Complaint status update error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not update complaint status."
      });
    }
  }
);

// SUBMIT COMPLAINT
app.post("/api/complaints", authenticate, async (req, res) => {
  try {
    const { category, location, description } = req.body;

    if (
      !category ||
      !location?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all complaint details."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO complaints
       (student_id, category, location, description)
       VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        category,
        location.trim(),
        description.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully!",
      complaintId: result.insertId
    });

  } catch (error) {
    console.error("Complaint submission error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not submit complaint."
    });
  }
});

// GET LOGGED-IN STUDENT COMPLAINTS
app.get("/api/complaints", authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, category, location, description,
              status, created_at
       FROM complaints
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      complaints: rows
    });

  } catch (error) {
    console.error("Complaint fetching error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch complaints."
    });
  }
});


// START SERVER
// Get all hostels
app.get("/api/hostels", async (req, res) => {
  try {
    const [hostels] = await db.query(
      "SELECT * FROM hostels ORDER BY id DESC"
    );

    res.json(hostels);
  } catch (error) {
    console.error("Hostel fetch error:", error);
    res.status(500).json({
      message: "Unable to fetch hostels"
    });
  }
});

// ================= HOSTEL MANAGEMENT APIs =================

// Get all hostels (Admin)
app.get("/api/admin/hostels", authenticate, requireAdmin, async (req, res) => {
  try {
    const [hostels] = await db.query(
      "SELECT * FROM hostels ORDER BY id DESC"
    );
    res.json({ hostels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load hostels" });
  }
});

// Add a new hostel
app.post("/api/admin/hostels", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, location, price, gender, rooms_available, facilities } = req.body;

    if (!name || !location || !price || !gender) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO hostels
       (name, location, price, gender, rooms_available, facilities)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, location, price, gender, rooms_available || 0, facilities || ""]
    );

    res.status(201).json({
      message: "Hostel added successfully",
      hostelId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to add hostel" });
  }
});

// Update hostel details
app.put("/api/admin/hostels/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, location, price, gender, rooms_available, facilities } = req.body;

    await db.query(
      `UPDATE hostels SET
       name = ?, location = ?, price = ?, gender = ?,
       rooms_available = ?, facilities = ?
       WHERE id = ?`,
      [name, location, price, gender, rooms_available, facilities, req.params.id]
    );

    res.json({ message: "Hostel updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to update hostel" });
  }
});

// Delete a hostel
app.delete("/api/admin/hostels/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM hostels WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Hostel deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete hostel" });
  }
});

// GET ALL MESS LISTINGS
app.get("/api/mess", async (req, res) => {
  try {
    const [messList] = await db.query(
      "SELECT * FROM mess ORDER BY id DESC"
    );

    res.json({ mess: messList });
  } catch (error) {
    console.error("Mess fetch error:", error);
    res.status(500).json({
      message: "Unable to fetch mess details."
    });
  }
});

// ================= MESS MANAGEMENT APIs =================

// GET ALL MESS LISTINGS (ADMIN)
app.get("/api/admin/mess", authenticate, requireAdmin, async (req, res) => {
  try {
    const [messList] = await db.query(
      "SELECT * FROM mess ORDER BY id DESC"
    );

    res.json({ success: true, mess: messList });
  } catch (error) {
    console.error("Admin mess fetch error:", error);
    res.status(500).json({ message: "Unable to load mess listings." });
  }
});

// ADD NEW MESS
app.post("/api/admin/mess", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, location, food_type, price, meal_timings } = req.body;

    if (
      !name?.trim() ||
      !location?.trim() ||
      !food_type?.trim() ||
      price === undefined ||
      price === "" ||
      !meal_timings?.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        message: "Please enter valid details in all fields."
      });
    }

    const [result] = await db.query(
      `INSERT INTO mess
       (name, location, food_type, price, meal_timings)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        location.trim(),
        food_type.trim(),
        Number(price),
        meal_timings.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Mess added successfully.",
      messId: result.insertId
    });
  } catch (error) {
    console.error("Mess add error:", error);
    res.status(500).json({ message: "Unable to add mess." });
  }
});

// UPDATE MESS
app.put("/api/admin/mess/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const messId = Number(req.params.id);
    const { name, location, food_type, price, meal_timings } = req.body;

    if (
      !Number.isInteger(messId) ||
      messId <= 0 ||
      !name?.trim() ||
      !location?.trim() ||
      !food_type?.trim() ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !meal_timings?.trim()
    ) {
      return res.status(400).json({
        message: "Please enter valid mess details."
      });
    }

    const [result] = await db.query(
      `UPDATE mess SET
       name = ?, location = ?, food_type = ?,
       price = ?, meal_timings = ?
       WHERE id = ?`,
      [
        name.trim(),
        location.trim(),
        food_type.trim(),
        Number(price),
        meal_timings.trim(),
        messId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mess listing not found." });
    }

    res.json({
      success: true,
      message: "Mess updated successfully."
    });
  } catch (error) {
    console.error("Mess update error:", error);
    res.status(500).json({ message: "Unable to update mess." });
  }
});

// DELETE MESS
app.delete("/api/admin/mess/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const messId = Number(req.params.id);

    if (!Number.isInteger(messId) || messId <= 0) {
      return res.status(400).json({ message: "Invalid mess ID." });
    }

    const [result] = await db.query(
      "DELETE FROM mess WHERE id = ?",
      [messId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mess listing not found." });
    }

    res.json({
      success: true,
      message: "Mess deleted successfully."
    });
  } catch (error) {
    console.error("Mess delete error:", error);
    res.status(500).json({ message: "Unable to delete mess." });
  }
});
// ================= GYM LISTING API =================

app.get("/api/gym", async (req, res) => {
  try {
    const [gymList] = await db.query(
      "SELECT * FROM gym ORDER BY id DESC"
    );

    res.json({ gym: gymList });
  } catch (error) {
    console.error("Gym fetch error:", error);

    res.status(500).json({
      message: "Unable to fetch gym details."
    });
  }
});

// ================= GYM MANAGEMENT APIs =================

// GET ALL GYMS (ADMIN)
app.get("/api/admin/gym", authenticate, requireAdmin, async (req, res) => {
  try {
    const [gymList] = await db.query(
      "SELECT * FROM gym ORDER BY id DESC"
    );

    res.json({ success: true, gym: gymList });
  } catch (error) {
    console.error("Admin gym fetch error:", error);
    res.status(500).json({ message: "Unable to load gym listings." });
  }
});

// ADD NEW GYM
app.post("/api/admin/gym", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, location, membership_price, facilities, timings } = req.body;

    if (
      !name?.trim() ||
      !location?.trim() ||
      membership_price === undefined ||
      membership_price === "" ||
      !Number.isFinite(Number(membership_price)) ||
      Number(membership_price) <= 0 ||
      !timings?.trim()
    ) {
      return res.status(400).json({
        message: "Please enter valid gym details."
      });
    }

    const [result] = await db.query(
      `INSERT INTO gym
       (name, location, membership_price, facilities, timings)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        location.trim(),
        Number(membership_price),
        facilities?.trim() || "",
        timings.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Gym added successfully.",
      gymId: result.insertId
    });
  } catch (error) {
    console.error("Gym add error:", error);
    res.status(500).json({ message: "Unable to add gym." });
  }
});

// UPDATE GYM
app.put("/api/admin/gym/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const gymId = Number(req.params.id);
    const { name, location, membership_price, facilities, timings } = req.body;

    if (
      !Number.isInteger(gymId) ||
      gymId <= 0 ||
      !name?.trim() ||
      !location?.trim() ||
      membership_price === undefined ||
      membership_price === "" ||
      !Number.isFinite(Number(membership_price)) ||
      Number(membership_price) <= 0 ||
      !timings?.trim()
    ) {
      return res.status(400).json({
        message: "Please enter valid gym details."
      });
    }

    const [result] = await db.query(
      `UPDATE gym SET
       name = ?, location = ?, membership_price = ?,
       facilities = ?, timings = ?
       WHERE id = ?`,
      [
        name.trim(),
        location.trim(),
        Number(membership_price),
        facilities?.trim() || "",
        timings.trim(),
        gymId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gym listing not found." });
    }

    res.json({
      success: true,
      message: "Gym updated successfully."
    });
  } catch (error) {
    console.error("Gym update error:", error);
    res.status(500).json({ message: "Unable to update gym." });
  }
});

// DELETE GYM
app.delete("/api/admin/gym/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const gymId = Number(req.params.id);

    if (!Number.isInteger(gymId) || gymId <= 0) {
      return res.status(400).json({ message: "Invalid gym ID." });
    }

    const [result] = await db.query(
      "DELETE FROM gym WHERE id = ?",
      [gymId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gym listing not found." });
    }

    res.json({
      success: true,
      message: "Gym deleted successfully."
    });
  } catch (error) {
    console.error("Gym delete error:", error);
    res.status(500).json({ message: "Unable to delete gym." });
  }
});
// =====================================
// STUDENT SERVICE REQUESTS
// =====================================

// Submit a service request
app.post("/api/service-requests", authenticate, async (req, res) => {
  try {
    const { service_name, room_number, issue, description } = req.body;

    if (!service_name || !room_number || !issue || !description) {
      return res.status(400).json({
        message: "Please fill in all fields."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO service_requests
      (student_id, service_name, room_number, issue, description)
      VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, service_name, room_number, issue, description]
    );

    res.status(201).json({
      message: "Service request submitted successfully!",
      id: result.insertId
    });
  } catch (error) {
    console.error("Service request error:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// Get requests of the logged-in student
app.get("/api/service-requests", authenticate, async (req, res) => {
  try {
    const [requests] = await db.execute(
      `SELECT * FROM service_requests
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(requests);
  } catch (error) {
    console.error("Fetch service requests error:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// Admin: Get all service requests
app.get(
  "/api/admin/service-requests",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [requests] = await db.execute(
        `SELECT sr.*, s.full_name, s.email
         FROM service_requests sr
         JOIN students s ON sr.student_id = s.id
         ORDER BY sr.created_at DESC`
      );

      res.json(requests);
    } catch (error) {
      console.error("Admin service requests error:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);



// Admin: Update service request status
app.patch(
  "/api/admin/service-requests/:id/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved"
      ];

      if (
        !Number.isInteger(requestId) ||
        requestId <= 0 ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid request ID or status."
        });
      }

      const [result] = await db.execute(
        "UPDATE service_requests SET status = ? WHERE id = ?",
        [status, requestId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Service request not found."
        });
      }

      await logActivity(
        req.user.id,
        "Service Request Updated",
        `Service Request #${requestId} status changed to ${status}`
      );

      res.json({
        message: "Status updated successfully!"
      });

    } catch (error) {
      console.error("Update service request error:", error);

      res.status(500).json({
        message: "Server error."
      });
    }
  }
);


// ================= STUDENT PROFILE =================

// Get logged-in student's profile
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, full_name, email, phone, role
       FROM students
       WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found."
      });
    }

    res.json({
      success: true,
      student: rows[0]
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch profile."
    });
  }
});

// Update logged-in student's profile
app.put("/api/profile", authenticate, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      full_name.trim().length > 100 ||
      (phone !== null && phone !== undefined &&
        (typeof phone !== "string" || phone.trim().length > 20))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid name and phone details."
      });
    }

    await db.execute(
      `UPDATE students
       SET full_name = ?, phone = ?
       WHERE id = ?`,
      [
        full_name.trim(),
        phone?.trim() || null,
        req.user.id
      ]
    );

    const [rows] = await db.execute(
      `SELECT id, full_name, email, phone, role
       FROM students
       WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully!",
      student: rows[0]
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not update profile."
    });
  }
});

// ================= PAYMENTS =================

// Get logged-in student's payments
app.get("/api/payments", authenticate, async (req, res) => {
  try {
    const [payments] = await db.query(
      "SELECT * FROM payments WHERE student_id = ? ORDER BY id DESC",
      [req.user.id]
    );

    res.json(payments);
  } catch (error) {
    console.error("Payments fetch error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

 // Create payment records for logged-in student
app.post("/api/payments/setup", authenticate, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO payments (student_id, title, amount, status)
       VALUES
         (?, 'Hostel Fees', 6000, 'Pending'),
         (?, 'Mess Fees', 3000, 'Paid'),
         (?, 'Gym Membership', 950, 'Pending')
       ON DUPLICATE KEY UPDATE id = id`,
      [req.user.id, req.user.id, req.user.id]
    );

    res.json({
      success: true,
      message: "Payment records ready"
    });

  } catch (error) {
    console.error("Payment setup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment records"
    });
  }
});


// Mark a payment as paid
app.patch("/api/payments/:id/pay", authenticate, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE payments
       SET status = 'Paid'
       WHERE id = ? AND student_id = ? AND status = 'Pending'`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Payment not found or already paid"
      });
    }

    await logActivity(
      req.user.id,
      "Payment Completed",
      `Payment #${req.params.id} was successfully marked as Paid`
    );

    res.json({ message: "Payment marked as paid" });
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({ message: "Failed to update payment" });
  }
});


// Admin: View all student payments
app.get("/api/admin/payments", authenticate, requireAdmin, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT payments.*, students.full_name, students.email
       FROM payments
       JOIN students ON payments.student_id = students.id
       ORDER BY payments.id DESC`
    );

    res.json(payments);
  } catch (error) {
    console.error("Admin payments error:", error);
    res.status(500).json({ message: "Failed to fetch all payments" });
  }
});
// ADMIN: GET ACTIVITY LOGS
app.get(
  "/api/admin/activity-logs",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [logs] = await db.execute(
        `SELECT
           activity_logs.*,
           students.full_name AS admin_name
         FROM activity_logs
         LEFT JOIN students
           ON activity_logs.admin_id = students.id
         ORDER BY activity_logs.created_at DESC
         LIMIT 100`
      );

      res.json({
        success: true,
        logs
      });

    } catch (error) {
      console.error("Activity logs error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to fetch activity logs."
      });
    }
  }
);
app.listen(PORT, () => {
  console.log(`CampusHub server running on http://localhost:${PORT}`);
});
