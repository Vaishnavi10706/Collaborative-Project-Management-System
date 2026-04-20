// routes/tasks.js
// Everything related to tasks (the cards on the Kanban board)
//
// GET    /api/tasks/project/:projectId  -> Get all tasks in a project
// POST   /api/tasks                     -> Create a new task
// PUT    /api/tasks/:id                 -> Update task (title, status, priority, etc.)
// DELETE /api/tasks/:id                 -> Delete a task

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

// GET all tasks for a specific project
// Also accepts query params for filtering: ?status=todo&priority=high
router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    // Build the filter object from query parameters
    let filter = { project: req.params.projectId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .populate("assignee", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 }); // newest first

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, project, assignee, dueDate, labels } = req.body;

    const task = new Task({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      project,
      assignee: assignee || null,
      dueDate: dueDate || null,
      labels: labels || [],
      createdBy: req.user.id,
    });

    await task.save();

    // Log the activity
    await Activity.create({
      user: req.user.id,
      project: project,
      task: task._id,
      action: `created task "${title}"`,
    });

    // Populate before sending back so frontend has full data
    const populated = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name");

    res.status(201).json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a task
// This is called whenever:
// - User drags a task to a different column (status changes)
// - User edits title/description
// - User changes priority or assignee
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate("assignee", "name email")
      .populate("createdBy", "name");

    // If status changed, log a specific message like "moved task to Done"
    if (req.body.status && req.body.status !== oldTask.status) {
      const statusNames = { todo: "To Do", inprogress: "In Progress", done: "Done" };
      await Activity.create({
        user: req.user.id,
        project: oldTask.project,
        task: oldTask._id,
        action: `moved task "${oldTask.title}" to ${statusNames[req.body.status]}`,
      });
    } else {
      await Activity.create({
        user: req.user.id,
        project: oldTask.project,
        task: oldTask._id,
        action: `updated task "${oldTask.title}"`,
      });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Activity.create({
      user: req.user.id,
      project: task.project,
      action: `deleted task "${task.title}"`,
    });

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET task stats for a project (used in the dashboard)
// Returns: total tasks, how many in each status
router.get("/stats/:projectId", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inprogress: tasks.filter((t) => t.status === "inprogress").length,
      done: tasks.filter((t) => t.status === "done").length,
      highPriority: tasks.filter((t) => t.priority === "high").length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
