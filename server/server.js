// server.js - This is the main file that starts our backend server
// Think of this as the "main gate" of our whole application

// dotenv lets us read the .env file (like PORT=5000, MONGO_URI, etc.)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// Create an express app - this is our web server
const app = express();

// http.createServer wraps the express app so Socket.io can also use it
// (Socket.io needs the raw http server, not just express)
const server = http.createServer(app);

// Set up Socket.io on our server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// ---- MIDDLEWARE ----
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

// express.json() lets us read JSON data that frontend sends us
app.use(express.json());

// ---- CONNECT TO MONGODB ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ---- ROUTES ----
// We break our routes into separate files to keep things clean
// /api/auth  -> handles login and register
// /api/projects -> handles creating/getting projects
// /api/tasks -> handles creating/editing/deleting tasks
// /api/activity -> handles the activity log (who did what)

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/activity", require("./routes/activity"));

// ---- SOCKET.IO ----
// Socket.io allows real-time communication
// For example: if UserA moves a task, UserB sees it instantly without refreshing
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // When a task is updated, broadcast to all other users in the same project
  socket.on("task_updated", (data) => {
    socket.broadcast.emit("task_updated", data);
  });

  // When a new task is created
  socket.on("task_created", (data) => {
    socket.broadcast.emit("task_created", data);
  });

  // When a task is deleted
  socket.on("task_deleted", (data) => {
    socket.broadcast.emit("task_deleted", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
