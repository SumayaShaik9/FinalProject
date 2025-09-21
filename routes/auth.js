const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/register
router.post("/register", async (req, res, next) => {
  const { username, email, password, language_code = "en" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password_hash, language_code)
      VALUES (?, ?, ?, ?)
    `;
    global.db.run(
      query,
      [username, email, hashedPassword, language_code],
      function (err) {
        if (err) return next(err);
        res.json({ success: true, userId: this.lastID });
      }
    );
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT user_id, username, password_hash, language_code FROM users WHERE username = ?",
        [username],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, language_code: user.language_code || "en" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Redirect user to GitHub for login
router.get("/github", (req, res) => {
  const redirectUri =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    "&scope=user:email";
  res.redirect(redirectUri);
});

// GitHub OAuth callback
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Received code:", code);

  if (!code) return res.status(400).send("Missing code");

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    console.log("GitHub access token:", accessToken);

    if (!accessToken) {
      console.error("No access token returned from GitHub");
      return res.status(500).send("GitHub OAuth failed");
    }

    // Fetch GitHub user info
    const githubRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = githubRes.data;
    console.log("GitHub user info:", githubUser);

    if (!githubUser || !githubUser.id) {
      return res.status(500).send("Failed to get GitHub user info");
    }

    const githubId = githubUser.id;
    const username = githubUser.login;
    const email = githubUser.email || null; // fallback if private email

    // Check if user exists in DB by github_id or email
    let user = await new Promise((resolve, reject) => {
      global.db.get(
        "SELECT * FROM users WHERE github_id = ? OR email = ?",
        [githubId, email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
    if (!user) {
      const insertRes = await new Promise((resolve, reject) => {
        global.db.run(
          `INSERT INTO users 
        (username, email, github_id, role, status, language_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [username, email, githubId, "user", "active", "en"],
          function (err) {
            if (err) return reject(err);
            resolve({ user_id: this.lastID, username, email });
          }
        );
      });
      user = insertRes;
    } else {
      console.log("Existing user found:", user);
    }

    // Sign JWT using internal user_id
    const token = jwt.sign(
      { userId: user.user_id, username: user.username, email: user.email, language_code: user.language_code || "en" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("JWT token generated:", token);

    // Redirect to frontend with token
    res.redirect(`http://127.0.0.1:9000/auth/callback?token=${token}`);
  } catch (err) {
    console.error("GitHub OAuth login failed:", err.message);
    res.status(500).send("GitHub OAuth login failed");
  }
});

module.exports = router;
