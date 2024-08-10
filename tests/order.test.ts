import request from 'supertest';
import app from '../src/app';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('Order API', () => {
    const token: string = process.env.DUMMY_TOKEN || '';

    test('should create a new order', async () => {
        const response = await request(app)
            .post('/cart/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                address: '123 Main St',
                totalAmount: 100,
                orderItems: [
                    { itemId: '66b4abc288d9da3424e63af0', quantity: 2 },
                    { itemId: '66b4ad0f88d9da3424e63af3', quantity: 1 },
                ],
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('order');
    });

    test('should return an error for empty cart', async () => {
        const response = await request(app)
            .post('/cart/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                address: '123 Main St',
                totalAmount: 0,
                orderItems: [],
            });

        expect(response.status).toBe(400);
    });
});
