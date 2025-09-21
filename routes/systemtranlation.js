const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// GET /system - all system
router.get("/:group_name", authenticateToken , async (req, res) => {
  const { group_name } = req.params;

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

    const translations = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM system_translations WHERE group_name = ? and language_code = ?`,
        [group_name, lang],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // If no translations in user's language, optionally fallback to English
    if (!translations.length && lang !== "en") {
      translations = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM system_translations WHERE group_name = ? AND language_code = ?`,
          [group_name, "en"],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });
    }

    res.json(translations);
  } catch (err) {
    console.error("Failed to fetch system translations:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
