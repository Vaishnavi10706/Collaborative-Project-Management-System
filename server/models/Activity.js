// models/Activity.js
// Activity log keeps track of "who did what and when"
// Like: "Vaishnavi moved task 'Fix Bug' to Done - 5 mins ago"
// This is what makes our app look professional - not many student projects have this!

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    // user: who performed this action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // project: in which project did this happen
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // task: which task was affected (optional - for project-level actions)
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // action: a description of what happened
    // Example: "moved task to Done", "created task", "deleted task"
    action: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
