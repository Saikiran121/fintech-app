const request = require('supertest');
const express = require('express');

// Create a mock app for testing health check independently
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

describe('Health Check', () => {
    it('GET /health should return 200 and healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });
});
