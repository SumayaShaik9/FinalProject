// tests/users.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// In-memory test DB
let db;

// Create a fresh Express app with routes mounted
let app;

beforeAll(async () => {
  // Initialize in-memory database
  db = new sqlite3.Database(':memory:');

  // Load schema
  const schema = fs.readFileSync('./db_schema.sql', 'utf8');
  await new Promise((resolve, reject) => {
    db.exec(schema, (err) => (err ? reject(err) : resolve()));
  });

  // Seed test user
  const hashed = await bcrypt.hash('password123', 10);
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, email, password_hash, language_code, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['TestUser', 'test@example.com', hashed, 'en', 'user', 'active'],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  // Create express app with your routes
  app = require('../index'); // make sure index.js exports the app
  global.db = db; // override the global db for tests
});

afterAll(async () => {
  // Close DB connection
  await new Promise((resolve) => db.close(resolve));
});

describe('User API Tests', () => {
  let testUserId;
  let token;

  beforeAll(async () => {
    // Get test user ID
    testUserId = await new Promise((resolve, reject) => {
      db.get(`SELECT user_id FROM users WHERE username = ?`, ['TestUser'], (err, row) => {
        if (err) return reject(err);
        resolve(row.user_id);
      });
    });

    // Sign JWT
    const payload = {
      userId: testUserId,
      username: 'TestUser',
      email: 'test@example.com',
      language_code: 'en'
    };
    token = jwt.sign(payload, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
  });

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
      .send({ display_name: 'UpdatedUser' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});