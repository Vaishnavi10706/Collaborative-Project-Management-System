// models/Project.js
// A Project is like a "workspace" or "board" - for example "Website Redesign Project"
// Many tasks belong to one project

const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    // name: the project title, like "College Website Redesign"
    name: {
      type: String,
      required: true,
    },

    // description: a short explanation of what this project is about
    description: {
      type: String,
      default: "",
    },

    // owner: who created this project
    // ref: "User" means this is linked to a User document in our database
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // members: list of users who are part of this project
    // This allows multiple people to collaborate on the same project
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // color: for UI purposes - each project can have a theme color
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
