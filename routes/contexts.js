const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// GET / - all contexts, automatically use user's language_code
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get user's preferred language
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT language_code FROM users WHERE user_id = ?",
        [userId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const lang = user?.language_code || "en";

    const contexts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT c.context_id, 
                COALESCE(ct.name, c.name) AS name,
                COALESCE(ct.description, c.description) AS description,
                c.icon
         FROM contexts c
         LEFT JOIN context_translations ct 
           ON c.context_id = ct.context_id AND ct.language_code = ?
         ORDER BY c.name`,
        [lang],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    res.json(contexts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /my-contexts - contexts linked to user's identities, automatically translated
router.get("/my-contexts", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get user's preferred language
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT language_code FROM users WHERE user_id = ?",
        [userId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const lang = user?.language_code || "en";

    const userContexts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DISTINCT c.context_id,
                         COALESCE(ct.name, c.name) AS name,
                         COALESCE(ct.description, c.description) AS description,
                         c.icon
         FROM identities i
         JOIN identity_contexts ic ON i.identity_id = ic.identity_id
         JOIN contexts c ON ic.context_id = c.context_id
         LEFT JOIN context_translations ct
           ON c.context_id = ct.context_id AND ct.language_code = ?
         WHERE i.user_id = ?`,
        [lang, userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    res.json(userContexts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
