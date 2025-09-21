// tests/contexts.test.js
const request = require('supertest');
const app = require('../index'); // exported app
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = global.db;

let testUserId;
let token;
let testIdentityId;

const testUser = {
  username: 'TestUser',
  email: 'test@example.com',
  password: 'password123',
  language_code: 'en'
};

beforeAll(async () => {
  // Clean old test user
  await new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE username = ?`, [testUser.username], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Insert fresh test user
  const hashed = await bcrypt.hash(testUser.password, 10);
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, email, password_hash, language_code, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [testUser.username, testUser.email, hashed, testUser.language_code, 'user', 'active'],
      function (err) {
        if (err) return reject(err);
        testUserId = this.lastID;
        resolve();
      }
    );
  });

  // Sign JWT for this user
  const payload = {
    userId: testUserId,
    username: testUser.username,
    email: testUser.email,
    language_code: testUser.language_code
  };
  token = jwt.sign(payload, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

  // Insert test identity (without display_name)
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO identities (user_id, visibility)
       VALUES (?, ?)`,
      [testUserId, 'public'],
      function (err) {
        if (err) return reject(err);
        testIdentityId = this.lastID;
        resolve();
      }
    );
  });

  // Insert test context
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO contexts (name, description, icon) VALUES (?, ?, ?)`,
      ['Test Context', 'A context for testing', 'test-icon'],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  // Link identity to context
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO identity_contexts (identity_id, context_id) VALUES (?, ?)`,
      [testIdentityId, 1], // assuming context_id = 1
      (err) => (err ? reject(err) : resolve())
    );
  });
});

afterAll(async () => {
  // Clean up identities and users
  await new Promise((resolve) => db.run(`DELETE FROM identity_contexts`, [], () => resolve()));
  await new Promise((resolve) => db.run(`DELETE FROM contexts`, [], () => resolve()));
  await new Promise((resolve) => db.run(`DELETE FROM identities`, [], () => resolve()));
  await new Promise((resolve) => db.run(`DELETE FROM users`, [], () => resolve()));
});

describe('Contexts API', () => {
  it('GET /contexts should return all contexts', async () => {
    const res = await request(app)
      .get('/contexts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /contexts/my-contexts should return user-linked contexts', async () => {
    const res = await request(app)
      .get('/contexts/my-contexts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});