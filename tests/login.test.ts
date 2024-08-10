import request from 'supertest';
import app from '../src/app'; // Adjust the path to your app

describe('Login API', () => {
  test('should log in an existing user successfully', async () => {
    await request(app)
      .post('/signup')
      .send({
        name: 'Aman',
        email: 'aman@example.com',
        password: 'password123',
        referral: '1234',
      });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'aman@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
  });

  test('should return an error for invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'none@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(404);
    expect(response.body.err).toBe('User does not exist');
  });

  test('should return an error for wrong password', async () => {
    await request(app)
      .post('/signup')
      .send({
        nname: 'Aman',
        email: 'aman@example.com',
        password: 'password123',
        referral: '1234',
      });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'aman@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.err).toBe('Wrong Password');
  });
});
