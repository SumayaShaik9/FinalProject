// tests/setupTestDb.js
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

module.exports = async () => {
  global.db = new sqlite3.Database(":memory:");

  // Load schema.sql into memory
  const schema = fs.readFileSync("./db_schema.sql", "utf8");

  await new Promise((resolve, reject) => {
    global.db.exec(schema, (err) => (err ? reject(err) : resolve()));
  });

  // Seed a test user
  const bcrypt = require("bcrypt");
  const hash = bcrypt.hashSync("password123", 10);

  await new Promise((resolve, reject) => {
    global.db.run(
      `INSERT INTO users (username, email, password_hash, language_code, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["TestUser", "test@example.com", hash, "en", "user", "active"],
      (err) => (err ? reject(err) : resolve())
    );
  });
};
