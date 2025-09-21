const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// Test route
router.post("/test", (req, res) => {
  res.send("✅ /users/test route works!");
});

// GET /users/profile - fetch logged-in user profile
router.get("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // from JWT token
  console.log("userId", userId);

  try {
    const profile = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
            u.user_id,
            u.username,
            u.description,
            i.profile_photo
         FROM users u
         LEFT JOIN identities i ON i.user_id = u.user_id AND i.visibility = 'public'
         WHERE u.user_id = ?`,
        [userId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List all users (admin only)
router.get("/list-users", authenticateToken, async (req, res, next) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        "SELECT user_id, username, email, role, status FROM users",
        [],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/audit-logs", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const logs = await new Promise((resolve, reject) => {
      db.all(
        `SELECT al.id, al.action, al.resource, al.timestamp, c.name AS context_name
         FROM audit_logs al
         LEFT JOIN contexts c ON al.context_id = c.context_id
         WHERE al.user_id = ?
         ORDER BY al.timestamp DESC
         LIMIT 50`,
        [userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /profile-overview - fetch primary identity + profile metadata for logged-in user
router.get("/profile-overview", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const userLang = req.user.language_code || "en";
  try {
    const overview = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
       COALESCE(it.display_name, 'Unnamed') AS primary_identity,
       pmt.website,
       pmt.location,
       pmt.organization,
       pmt.bio
     FROM identities i
     JOIN identity_contexts ic ON i.identity_id = ic.identity_id AND ic.is_primary = 1
     LEFT JOIN profile_metadata pm ON i.user_id = pm.user_id AND pm.context_id = ic.context_id
     LEFT JOIN profile_metadata_translations pmt 
       ON pm.id = pmt.profile_metadata_id AND pmt.language_code = ?
     LEFT JOIN identity_translations it
       ON i.identity_id = it.identity_id AND it.language_code = ?
     WHERE i.user_id = ?`,
        [userLang, userLang, userId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    res.json(overview);
  } catch (err) {
    console.error("Failed to fetch profile overview:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all languages
router.get("/languages", authenticateToken, async (req, res) => {
  try {
    const languages = await new Promise((resolve, reject) => {
      db.all(
        `SELECT language_id, name, code
         FROM languages
         ORDER BY name`,
        [],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    res.json(languages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET up to 6 users excluding the logged-in user
router.get("/six", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // from authenticateToken middleware
  const userLang = req.user.language_code || "en";

  console.log("userId", userId);
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
       i.identity_id AS id,
       it.display_name AS name,
       u.username,
       u.email,
       c.name AS context,
       i.profile_photo AS avatar
     FROM identities i
     JOIN users u ON i.user_id = u.user_id
     LEFT JOIN identity_translations it 
       ON i.identity_id = it.identity_id AND it.language_code = ?
     LEFT JOIN identity_contexts ic ON i.identity_id = ic.identity_id
     LEFT JOIN contexts c ON ic.context_id = c.context_id
     WHERE i.user_id != ?`,
        [userLang, userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    console.log("users", users);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Search identities
router.post("/search", authenticateToken, async (req, res) => {
  const userLang = req.user.language_code || "en";

  try {
    const filters = req.body;
    console.log("filters", filters);

    // Build WHERE clauses dynamically
    const whereClauses = [];
    const params = [userLang, userLang]; // first for identity_translations, second for profile_metadata_translations

    if (filters.display_name) {
      whereClauses.push("it.display_name LIKE ?");
      params.push(`%${filters.display_name}%`);
    }
    if (filters.nickname) {
      whereClauses.push("it.nickname LIKE ?");
      params.push(`%${filters.nickname}%`);
    }
    if (filters.gender_identity) {
      whereClauses.push("it.gender_identity = ?");
      params.push(filters.gender_identity);
    }
    if (filters.location) {
      whereClauses.push("pmt.location LIKE ?");
      params.push(`%${filters.location}%`);
    }
    if (filters.organization) {
      whereClauses.push("pmt.organization LIKE ?");
      params.push(`%${filters.organization}%`);
    }
    if (filters.context) {
      whereClauses.push("( ? IS NULL OR ic.context_id = ? )");
      params.push(filters.context, filters.context);
    }
    if (filters.tags && filters.tags.length) {
      whereClauses.push(
        `ut.tag_id IN (${filters.tags.map(() => "?").join(",")})`
      );
      params.push(...filters.tags);
    }
    if (filters.website) {
      whereClauses.push("pmt.website LIKE ?");
      params.push(`%${filters.website}%`);
    }

    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    const sql = `
      SELECT 
        i.identity_id,
        COALESCE(it.display_name, 'Unnamed') AS display_name,
        COALESCE(it.nickname, '') AS nickname,
        COALESCE(it.gender_identity, '') AS gender_identity,
        i.profile_photo,
        l.name AS language,
        pmt.location,
        pmt.organization,
        c.name AS context,
        GROUP_CONCAT(t.name) AS tags,
        pmt.website
      FROM identities i
      LEFT JOIN identity_translations it 
        ON i.identity_id = it.identity_id AND it.language_code = ?
      LEFT JOIN languages l 
        ON it.language_code = l.code
      LEFT JOIN profile_metadata pm 
        ON i.user_id = pm.user_id
      LEFT JOIN profile_metadata_translations pmt 
        ON pm.id = pmt.profile_metadata_id AND pmt.language_code = ?
      LEFT JOIN identity_contexts ic ON i.identity_id = ic.identity_id
      LEFT JOIN contexts c ON ic.context_id = c.context_id
      LEFT JOIN user_tags ut ON i.user_id = ut.user_id
      LEFT JOIN tags t ON ut.tag_id = t.tag_id
      ${whereSQL}
      GROUP BY i.identity_id
      ORDER BY display_name
      LIMIT 100
    `;

    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log("rows", rows);
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info
router.get("/settings/account-info", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get basic user info
    const sql = `
      SELECT 
        user_id,
        username,
        email,
        language_code,
        github_id,
        role,
        status
      FROM users
      WHERE user_id = ?
    `;

    db.get(sql, [userId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log("account-info", user);
      res.json(user);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/save', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, email, password, language_code, github_id } = req.body;

  try {
    const fields = [];
    const params = [];

    if (username) { fields.push('username = ?'); params.push(username); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?'); 
      params.push(hash);
    }
    if (language_code) { fields.push('language_code = ?'); params.push(language_code); }
    if (github_id) { fields.push('github_id = ?'); params.push(github_id); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    params.push(userId);

    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Check if row was actually updated
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found or no changes made' });
      }

      res.json({ success: true, message: 'Account updated successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
