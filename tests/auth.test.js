  // tests/auth.test.js
  const request = require('supertest');
  const app = require('../index'); // import the Express app
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt');

  const db = global.db;

  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

  describe('Auth API', () => {

    const testUser = {
      username: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
      language_code: 'en'
    };

    beforeAll((done) => {
      // Clean up and create test user
      db.run(`DELETE FROM users WHERE username = ?`, [testUser.username], (err) => {
        if (err) return done(err);
        const hashed = bcrypt.hashSync(testUser.password, 10);
        db.run(
          `INSERT INTO users (username, email, password_hash, language_code, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [testUser.username, testUser.email, hashed, testUser.language_code, 'user', 'active'],
          done
        );
      });
    });

    afterAll((done) => {
      // Clean up test user
      db.run(`DELETE FROM users WHERE username = ?`, [testUser.username], done);
    });

    it('POST /auth/register - missing fields returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'NewUser' }); // missing email and password

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /auth/register - successful registration', async () => {
      const newUser = {
        username: 'NewUser',
        email: 'newuser@example.com',
        password: 'newpassword'
      };
      const res = await request(app)
        .post('/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('userId');

      // Cleanup new user
      db.run(`DELETE FROM users WHERE username = ?`, [newUser.username]);
    });

    it('POST /auth/login - correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: testUser.username, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');

      // Verify token payload
      const payload = jwt.verify(res.body.token, JWT_SECRET);
      expect(payload.username).toBe(testUser.username);
      expect(payload.userId).toBeDefined();
    });

    it('POST /auth/login - wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: testUser.username, password: 'wrongpassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('POST /auth/login - non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'fakeuser', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it('GET /auth/github - redirects to GitHub', async () => {
      const res = await request(app).get('/auth/github');
      expect(res.statusCode).toBe(302); // redirect
      expect(res.headers.location).toMatch(/^https:\/\/github\.com\/login\/oauth\/authorize/);
    });

    it('GET /auth/callback - missing code returns 400', async () => {
      const res = await request(app).get('/auth/callback');
      expect(res.statusCode).toBe(400);
      expect(res.text).toBe('Missing code');
    });
  });
