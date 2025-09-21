// tests/users.test.js
const request = require('supertest');
const app = require('../index'); // exported app
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // use bcrypt instead of bcryptjs

const db = global.db; // provided by setupTestDb.js

let testUserId;
let token;
const testUser = {
  username: 'TestUser',
  email: 'test@example.com',
  password: 'password123',
  language_code: 'en'
};

beforeAll(async () => {
  // Remove any old test user
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
});

afterAll(async () => {
  // Clean up test user
  await new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE user_id = ?`, [testUserId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
});

describe('User API Tests', () => {
  it('PUT /users/settings/save should update account info', async () => {
    const newData = {
      username: 'UpdatedUser',
      email: 'updated@example.com'
    };

    const res = await request(app)
      .put('/users/settings/save')
      .set('Authorization', `Bearer ${token}`)
      .send(newData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify DB updated
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE user_id = ?', [testUserId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    expect(row.username).toBe(newData.username);
    expect(row.email).toBe(newData.email);
  });

  it('POST /users/search should return filtered identities', async () => {
    const res = await request(app)
      .post('/users/search')
      .set('Authorization', `Bearer ${token}`)
      .send({ display_name: 'UpdatedUser' }); // matches updated username

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
