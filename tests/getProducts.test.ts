import request from 'supertest';
import app from '../src/app';

describe('GET /products', () => {
  test('should return all products', async () => {
    const response = await request(app)
      .get('/shop/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('should handle errors gracefully', async () => {

    const response = await request(app)
      .get('/shop/products?error=true');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});
