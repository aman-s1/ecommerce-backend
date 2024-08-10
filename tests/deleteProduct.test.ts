import request from 'supertest';
import app from '../src/app';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('DELETE /products/:id', () => {
  test('should delete a product if ID is valid and user is admin', async () => {
    const token = process.env.ADMIN_TOKEN;
    const productId = '66b6eef1f1dc4e9097071ecc';

    const response = await request(app)
      .delete(`/shop/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Item removed successfully' });
  });

  test('should return 404 if product does not exist', async () => {
    const token = process.env.ADMIN_TOKEN;
    const invalidProductId = '66b6eef1f1dc4e9097071abc';

    const response = await request(app)
      .delete(`/shop/products/${invalidProductId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Item not found' });
  });
});
