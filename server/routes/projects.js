// routes/projects.js
// All project-related API endpoints
//
// GET    /api/projects          -> Get all projects for logged-in user
// POST   /api/projects          -> Create a new project
// GET    /api/projects/:id      -> Get a single project details
// PUT    /api/projects/:id      -> Update project name/description
// DELETE /api/projects/:id      -> Delete a project
// POST   /api/projects/:id/members -> Add a member to project

const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

// All routes below require login (authMiddleware)

// GET all projects where user is owner OR a member
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate("owner", "name email") // replace owner id with their name/email
      .populate("members", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = new Project({
      name,
      description,
      color,
      owner: req.user.id,
      members: [req.user.id], // owner is automatically a member
    });

    await project.save();

    // Log this activity
    await Activity.create({
      user: req.user.id,
      project: project._id,
      action: `created project "${name}"`,
    });

    // Populate before returning so frontend gets full owner/members objects
    const populated = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET single project by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a project (only owner can update)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Not found" });

    // Only the owner can edit the project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can edit project" });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // return the updated document
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a project (only owner can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Not found" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can delete project" });
    }

    // Delete all tasks in the project first
    await Task.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST add a member to project using their email
router.post("/:id/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // Check if already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    project.members.push(userToAdd._id);
    await project.save();

    // Log this activity
    await Activity.create({
      user: req.user.id,
      project: project._id,
      action: `added ${userToAdd.name} to the project`,
    });

    res.json({ message: `${userToAdd.name} added to project!` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
