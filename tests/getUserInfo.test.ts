import request from 'supertest';
import app from '../src/app';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('GET /user/info', () => {
  test('should return user info if user is authenticated', async () => {
    const token = process.env.DUMMY_TOKEN;

    const response = await request(app)
      .get('/shop/')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
  });

  test('should return 401 if user is not authenticated', async () => {
    const response = await request(app)
      .get('/shop/');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Token not provided' });
  });
});
