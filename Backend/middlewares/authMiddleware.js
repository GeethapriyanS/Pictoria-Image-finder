const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
