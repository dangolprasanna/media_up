const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    // If no token is present
    if (!token) {
      res.status(401).json({ message: "No Token found" });
      return;
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Token is incorrect" });
        return;
      }

      // Token is valid, attach user info to request
      req.user = decoded.user;
      next();
    });
  } else {
    res.status(401).json({ message: "Issue with validation of token" });
    return;
  }
});

module.exports = { validateToken };