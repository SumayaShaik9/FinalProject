const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// Get all contexts
router.get("/", authenticateToken, async (req, res) => {
  try {
    const contexts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT context_id, name, description, icon 
         FROM contexts 
         ORDER BY name`,
        [],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    res.json(contexts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-social-links", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const userLang = req.user.language_code || "en";

  try {
    const socialLinks = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           sl.link_id,
           sl.platform,
           sl.url,
           i.identity_id,
           it.display_name,
           c.context_id,
           c.name AS context_name,
           c.icon AS context_icon
         FROM social_links sl
         JOIN identities i ON sl.identity_id = i.identity_id
         LEFT JOIN identity_translations it 
           ON i.identity_id = it.identity_id AND it.language_code = ?
         LEFT JOIN identity_contexts ic 
           ON i.identity_id = ic.identity_id
         LEFT JOIN contexts c 
           ON ic.context_id = c.context_id
         WHERE i.user_id = ?
         ORDER BY i.identity_id, ic.is_primary DESC`,
        [userLang, userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    res.json(socialLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
