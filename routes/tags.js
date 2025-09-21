const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// // Get all tags
// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const tags = await new Promise((resolve, reject) => {
//       db.all(
//         `SELECT tag_id, name, description 
//          FROM tags 
//          ORDER BY name`,
//         [],
//         (err, rows) => (err ? reject(err) : resolve(rows))
//       );
//     });
//     res.json(tags);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// GET /tags - all tags, automatically use user's language_code
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

    // Fetch tags with translations
    const tags = await new Promise((resolve, reject) => {
      db.all(
        `SELECT t.tag_id,
                COALESCE(tt.name, t.name) AS name,
                COALESCE(tt.description, t.description) AS description
         FROM tags t
         LEFT JOIN tag_translations tt 
           ON t.tag_id = tt.tag_id AND tt.language_code = ?
         ORDER BY t.name`,
        [lang],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /my-tags - fetch all tags for the logged-in user
router.get("/my-tags", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const tags = await new Promise((resolve, reject) => {
      db.all(
        `SELECT t.tag_id, t.name, t.description
         FROM user_tags ut
         JOIN tags t ON ut.tag_id = t.tag_id
         WHERE ut.user_id = ?`,
        [userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
