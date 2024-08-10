import request from 'supertest';
import app from '../src/app';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('POST /products/add', () => {
  test('should add a new product if request is valid and user is admin', async () => {
    const token = process.env.ADMIN_TOKEN;

    const response = await request(app)
      .post('/shop/add-product')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Product',
        description: 'Product Description',
        price: 100,
        image: 'http://example.com/image.jpg',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('item');
    expect(response.body.item).toHaveProperty('title', 'New Product');
  });

  test('should return 400 if request data is invalid', async () => {
    const token = process.env.ADMIN_TOKEN;

    const response = await request(app)
      .post('/shop/add-product')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        description: '',
        price: -10,
        image: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'All fields are required' });
  });
});
