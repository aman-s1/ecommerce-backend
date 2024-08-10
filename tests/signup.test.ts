import request from 'supertest';
import app from '../src/app';

describe('Signup API', () => {
  test('should sign up a new user successfully', async () => {
    const response = await request(app)
      .post('/signup') 
      .send({
        name: 'Aman',
        email: 'aman@example.com',
        password: 'password123',
        referral: '1234',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully Signed Up');
  });

  test('should return an error for empty fields', async () => {
    const response = await request(app)
      .post('/signup')
      .send({
        name: '',
        email: '',
        password: '',
        referral: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.err).toBe('Empty Fields');
  });

  test('should return an error for existing user', async () => {
    await request(app)
      .post('/signup')
      .send({
        name: 'Aman',
        email: 'aman@example.com',
        password: 'password123',
        referral: '',
      });

    const response = await request(app)
      .post('/signup')
      .send({
        name: 'Aman',
        email: 'aman@example.com',
        password: 'password123',
        referral: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.err).toBe('User with this email already exists');
  });
});
