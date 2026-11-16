
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config({ path: "src/backend/.env" });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
app.post("/api/login", async (req, res) => {
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

// SUBMIT COMPLAINT
app.post("/api/complaints", async (req, res) => {
  try {
    const {
      student_id,
      category,
      location,
      description
    } = req.body;

    if (
      !Number.isInteger(Number(student_id)) ||
      Number(student_id) <= 0 ||
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
        Number(student_id),
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

// GET STUDENT COMPLAINTS
app.get("/api/complaints/:studentId", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID."
      });
    }

    const [rows] = await db.execute(
      `SELECT id, category, location, description,
              status, created_at
       FROM complaints
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
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
app.listen(PORT, () => {
  console.log(`CampusHub server running on http://localhost:${PORT}`);
});
