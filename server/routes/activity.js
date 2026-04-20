// routes/activity.js
// Fetch the activity log for a project
// This shows things like "Vaishnavi created task Fix Bug - 5 mins ago"

const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

// GET activity for a specific project (latest 20 entries)
router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate("user", "name email")  // show who did it
      .sort({ createdAt: -1 })         // newest first
      .limit(20);                      // only last 20 actions

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
