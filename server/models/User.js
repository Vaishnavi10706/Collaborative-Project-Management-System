// models/User.js
// This file defines what a "User" looks like in our database
// Think of it like designing a form: what info do we collect from each user?

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // name: the user's full name (required - they have to fill this)
    name: {
      type: String,
      required: true,
    },

    // email: used for login (must be unique - no two users can share email)
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // password: stored as a hashed/encrypted version (not plain text!)
    // bcryptjs will convert "abc123" -> "$2b$10$..." for security
    password: {
      type: String,
      required: true,
    },

    // avatar: optional profile picture URL
    // We use a default so every user has a picture from the start
    avatar: {
      type: String,
      default: "",
    },
  },
  // timestamps: true automatically adds createdAt and updatedAt fields
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
