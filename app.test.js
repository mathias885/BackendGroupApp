const request = require('supertest');
const app = require('./main');

describe('testo di prova', () => {

    test('GET /event/filtered - Should create a draft', async () => {
        const response = await request(app)
            .get('/event/filtered');
        expect(response.statusCode).toBe(200);
    });

});
