const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Token missing" });

  // Use fallback secret for testing
  const secret = process.env.JWT_SECRET || "testsecret";

  jwt.verify(token, secret, (err, user) => {
    // console.log('Decoded JWT payload:', user);
    if (err) return res.status(403).json({ error: "Token invalid" });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;