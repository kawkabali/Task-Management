const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });

// ===============================
// Routes
// ===============================
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

// ===============================
// Home Route
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager API is running...",
  });
});

// ===============================
// Start Server (Local Only)
// ===============================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ===============================
// Export for Vercel
// ===============================
module.exports = app;