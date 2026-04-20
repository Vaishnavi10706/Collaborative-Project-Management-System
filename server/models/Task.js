// models/Task.js
// A Task is a single card on the Kanban board
// Example: "Fix login bug" - can be in To Do, In Progress, or Done column

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    // title: short name of the task - shown on the card
    title: {
      type: String,
      required: true,
    },

    // description: more details about what needs to be done
    description: {
      type: String,
      default: "",
    },

    // status: which column/board this task is in
    // This is what changes when you drag a card from one column to another
    status: {
      type: String,
      enum: ["todo", "inprogress", "done"], // only these 3 values allowed
      default: "todo",
    },

    // priority: how urgent is this task?
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // project: which project does this task belong to?
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // assignee: which team member is responsible for this task?
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // createdBy: who made this task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // dueDate: when should this be completed?
    dueDate: {
      type: Date,
      default: null,
    },

    // labels: custom tags like "frontend", "bug", "feature"
    labels: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
