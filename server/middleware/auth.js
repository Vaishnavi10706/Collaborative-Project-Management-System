// middleware/auth.js
// This is a "security guard" function
// Before accessing protected pages (like your projects), 
// this checks: "Do you have a valid login token?"
//
// HOW IT WORKS:
// 1. When you log in, the server gives you a "token" (like a wristband at an event)
// 2. Every time you make a request, you send that token in the header
// 3. This middleware checks if the token is real and not expired

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  // Frontend sends it like: Authorization: "Bearer eyJhbGciOiJIUzI1..."
  const authHeader = req.headers["authorization"];

  // If no token found, reject the request
  if (!authHeader) {
    return res.status(401).json({ message: "No token, please login first" });
  }

  // The header looks like "Bearer <token>", so we split and take the 2nd part
  const token = authHeader.split(" ")[1];

  // jwt.verify checks if the token is real and matches our secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid or expired" });
    }

    // If valid, attach the user info to the request so routes can use it
    // Now in any route we can do req.user.id to know who is logged in
    req.user = decoded;
    next(); // continue to the actual route
  });
};

module.exports = authMiddleware;
