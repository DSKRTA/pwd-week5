// tests/restaurants.service.test.js
const mongoose = require('mongoose'); // Import Mongoose
const restaurantService = require('../src/services/restaurants.service');
const Restaurant = require('../src/models/restaurant.model'); // Import your model

// Use your .env variables for the test database
require('dotenv').config();

describe('RestaurantService', () => {
    // 1. Connect to the database before any tests run
    beforeAll(async () => {
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

    test('getAllRestaurants resolves with data', async () => {
        // Add a sample restaurant to the DB for the test
        await Restaurant.create({ name: 'Service Test Cafe', category: 'Cafe', location: 'There' });

        const restaurants = await restaurantService.getAllRestaurants();
        expect(Array.isArray(restaurants)).toBe(true);
        expect(restaurants.length).toBe(1);
        expect(restaurants[0].name).toBe('Service Test Cafe');
    });

    test('createRestaurant appends a new entry', async () => {
        const payload = {
            name: '테스트 식당',
            category: '테스트',
            location: '가상 캠퍼스'
        };

        const created = await restaurantService.createRestaurant(payload);
        expect(created._id).toBeDefined(); // Mongoose uses _id
        expect(created.name).toBe(payload.name);

        const found = await Restaurant.findById(created._id);
        expect(found).toBeTruthy();
        expect(found.name).toBe(payload.name);
    });

    test('createRestaurant rejects invalid payloads', async () => {
        await expect(
            restaurantService.createRestaurant({ name: '누락된 식당' })
        ).rejects.toThrow("Restaurant validation failed: category: Path `category` is required.");
    });
});