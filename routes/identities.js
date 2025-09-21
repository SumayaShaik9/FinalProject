const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// GET /identities - fetch all identities for logged-in user
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const userLang = req.user.language_code || "en";

  try {
    // 1. Fetch all identities for user
    const identities = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM identities WHERE user_id = ?`,
        [userId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // If no identities, return empty array
    if (!identities.length) return res.json([]);

    const identityIds = identities.map(i => i.identity_id).join(",");

    // 2. Fetch all translations
    const translations = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM identity_translations WHERE identity_id IN (${identityIds})`,
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 3. Fetch all structured names
    const names = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM identity_names WHERE identity_id IN (${identityIds})`,
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 4. Fetch contexts
    const contexts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT ic.identity_id, ic.is_primary, c.name AS context_name
         FROM identity_contexts ic
         LEFT JOIN contexts c ON ic.context_id = c.context_id
         WHERE ic.identity_id IN (${identityIds})`,
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 5. Combine all into final response
    const result = identities.map(i => ({
      ...i,
      translations: translations.filter(t => t.identity_id === i.identity_id),
      names: names.filter(n => n.identity_id === i.identity_id),
      ...contexts.find(c => c.identity_id === i.identity_id),
    }));

    console.log(JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch identities:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST /identities - add new identity
router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  console.log('req.body',req.body);
  const {
    profile_photo,
    context_id,
    is_primary,
    visibility,
    names = [],
    translations = [],
  } = req.body;

  try {
    // 1. Insert identity (non-translatable fields only)
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO identities (user_id, profile_photo, visibility)
         VALUES (?, ?, ?)`,
        [userId, profile_photo || null, visibility || "public"],
        function (err) {
          if (err) return reject(err);
          resolve({ identity_id: this.lastID });
        }
      );
    });

    const identityId = result.identity_id;

    // 2. Insert structured names
    if (Array.isArray(names)) {
      for (const [i, n] of names.entries()) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO identity_names (identity_id, type, value, order_index)
             VALUES (?, ?, ?, ?)`,
            [identityId, n.type, n.value, n.order_index ?? i + 1],
            (err) => (err ? reject(err) : resolve())
          );
        });
      }
    }

    // 3. Insert translations
    if (Array.isArray(translations) && translations.length > 0) {
      for (const t of translations) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO identity_translations
              (identity_id, language_code, display_name, legal_name, nickname, gender_identity)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(identity_id, language_code) DO UPDATE SET
               display_name = excluded.display_name,
               legal_name = excluded.legal_name,
               nickname = excluded.nickname,
               gender_identity = excluded.gender_identity`,
            [
              identityId,
              t.language_code || "en",
              t.display_name || null,
              t.legal_name || null,
              t.nickname || null,
              t.gender_identity || null,
            ],
            (err) => (err ? reject(err) : resolve())
          );
        });
      }
    }

    // 4. Link context if provided
    if (context_id) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO identity_contexts (identity_id, context_id, is_primary)
           VALUES (?, ?, ?)
           ON CONFLICT(identity_id, context_id)
           DO UPDATE SET is_primary = excluded.is_primary`,
          [identityId, context_id, is_primary ? 1 : 0],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // 5. Add audit log
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO audit_logs (user_id, target_user_id, action, resource, context_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, userId, "Created Identity", "identity", context_id || null],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res
      .status(201)
      .json({ message: "Identity created", identity_id: identityId });
  } catch (err) {
    console.error("Failed to save identity:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /identities/:id - update identity
router.put("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const identityId = req.params.id;
  const {
    profile_photo,
    context_id,
    is_primary,
    visibility,
    names = [],
    translations = [],
  } = req.body;

  try {
    // 1. Update identity (non-translatable fields)
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE identities SET profile_photo = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
         WHERE identity_id = ? AND user_id = ?`,
        [profile_photo || null, visibility || "public", identityId, userId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    // 2. Replace names if provided
    if (Array.isArray(names)) {
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM identity_names WHERE identity_id = ?`,
          [identityId],
          (err) => (err ? reject(err) : resolve())
        );
      });

      for (const [i, n] of names.entries()) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO identity_names (identity_id, type, value, order_index)
             VALUES (?, ?, ?, ?)`,
            [identityId, n.type, n.value, n.order_index ?? i + 1],
            (err) => (err ? reject(err) : resolve())
          );
        });
      }
    }

    // 3. Update or insert translations
    if (Array.isArray(translations) && translations.length > 0) {
      for (const t of translations) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO identity_translations
              (identity_id, language_code, display_name, legal_name, nickname, gender_identity)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(identity_id, language_code) DO UPDATE SET
               display_name = excluded.display_name,
               legal_name = excluded.legal_name,
               nickname = excluded.nickname,
               gender_identity = excluded.gender_identity`,
            [
              identityId,
              t.language_code || "en",
              t.display_name || null,
              t.legal_name || null,
              t.nickname || null,
              t.gender_identity || null,
            ],
            (err) => (err ? reject(err) : resolve())
          );
        });
      }
    }

    // 4. Update or insert context link
    if (context_id) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO identity_contexts (identity_id, context_id, is_primary)
           VALUES (?, ?, ?)
           ON CONFLICT(identity_id, context_id)
           DO UPDATE SET is_primary = excluded.is_primary`,
          [identityId, context_id, is_primary ? 1 : 0],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // 5. Add audit log
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO audit_logs (user_id, target_user_id, action, resource, context_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, userId, "Updated Identity", "identity", context_id || null],
        (err) => (err ? reject(err) : resolve())
      );
    });

    res.json({ message: "Identity updated", identity_id: identityId });
  } catch (err) {
    console.error("Failed to update identity:", err); 
    res.status(500).json({ error: err.message });
  }
});

// DELETE /identities/:id - delete an identity
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // logged-in user
  const identityId = req.params.id;

  try {
    // 1. Check if the identity belongs to the user
    const identity = await db.get(
      `SELECT * FROM identities WHERE identity_id = ? AND user_id = ?`,
      [identityId, userId]
    );

    if (!identity) {
      return res.status(404).json({ error: 'Identity not found or not owned by user' });
    }

    // 2. Delete related translations
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM identity_translations WHERE identity_id = ?`, [identityId], err =>
        err ? reject(err) : resolve()
      );
    });

    // 3. Delete related structured names
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM identity_names WHERE identity_id = ?`, [identityId], err =>
        err ? reject(err) : resolve()
      );
    });

    // 4. Delete related contexts
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM identity_contexts WHERE identity_id = ?`, [identityId], err =>
        err ? reject(err) : resolve()
      );
    });

    // 5. Delete the identity itself
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM identities WHERE identity_id = ?`, [identityId], err =>
        err ? reject(err) : resolve()
      );
    });

    // 6. Add audit log
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO audit_logs (user_id, target_user_id, action, resource, context_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, userId, 'Deleted Identity', 'identity', null],
        err => (err ? reject(err) : resolve())
      );
    });

    res.json({ message: 'Identity deleted successfully' });
  } catch (err) {
    console.error('Failed to delete identity:', err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
