// routes/auth.js
// This handles user Registration and Login
// 
// POST /api/auth/register  -> Create a new account
// POST /api/auth/login     -> Login with email + password
// GET  /api/auth/me        -> Get current logged-in user's info

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// ---- REGISTER ----
// When someone signs up, we save them in the database
// We NEVER store plain passwords - always hash them first
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password (10 = salt rounds, higher = more secure but slower)
    // "salt" adds random characters to make even same passwords look different
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in database
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate a token so user is automatically logged in after signup
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token expires after 7 days
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- LOGIN ----
// Check email + password, if correct -> give token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET CURRENT USER ----
// Protected route - needs valid token
// Used to check if user is still logged in when they refresh the page
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from our authMiddleware
    const user = await User.findById(req.user.id).select("-password"); // don't send password
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
