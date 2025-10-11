// tests/restaurants.routes.test.js
const request = require('supertest');
const mongoose = require('mongoose'); // Import Mongoose
const createApp = require('../src/app');
const Restaurant = require('../src/models/restaurant.model'); // Import your model

// Use your .env variables for the test database
require('dotenv').config();

describe('Restaurant routes', () => {
    let app;

    // 1. Connect to the database before any tests run
    beforeAll(async () => {
        app = createApp();
        // Use a separate test database URI if you have one
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // 2. Clear the restaurants collection after each test
    afterEach(async () => {
        await Restaurant.deleteMany({});
    });

    // 3. Disconnect from the database after all tests are done
    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('GET /api/restaurants returns a list', async () => {
        // Add a sample restaurant to the DB for the test
        await Restaurant.create({ name: 'Test Cafe', category: 'Cafe', location: 'Here' });

        const response = await request(app).get('/api/restaurants');
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1); // Check that the created item is there
    });

    // ... The rest of your tests ...
    // Make sure to create any data you need for GET /:id tests

    test('POST /api/restaurants creates a restaurant', async () => {
        const payload = {
            name: '새로운 식당',
            category: '카페',
            location: '캠퍼스 타운',
        };

        const response = await request(app)
            .post('/api/restaurants')
            .send(payload)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe(payload.name);

        // Verify it was actually saved to the database
        const count = await Restaurant.countDocuments();
        expect(count).toBe(1);
    });
});