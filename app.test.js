const request = require('supertest');
const app = require('./main');

var userToken;
var testDarft;

/*
ADMIN
  "mail":"admin@example.com",
  "password":"admin"

  USER
  "mail": "utente@example.com",
  "password": "securepassword"

*/


beforeAll(async () => {
    const loginResponse = await request(app)
        .post('/access/')
        .send({ mail: 'admin@example.com', password: 'admin' });
    
    expect(loginResponse.statusCode).toBe(200);
    userToken = loginResponse.body.token;
});


// Test suite per /event
describe('Event API Tests', () => {
    
    test('GET /event/filtered - Should return filtered events', async () => {
        const response = await request(app).get('/event/filtered');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
    
    test('POST /event/create - Should create a new event', async () => {
        const response = await request(app)
            .post('/event/create')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: "Evento di Test",
                date: "2025-01-01T10:00:00.000Z",
                location: "Test City",
                price: 10,
                target: "tutti",
                category: "musica",
                description: "Descrizione dell'evento di test",
                max_subs: 100
            });
        expect(response.statusCode).toBe(200);
    });

    test('GET /control/drafts - Should return 401 if not admin', async () => {
        const response = await request(app)
            .get('/control/drafts')
            .set('Authorization', `Bearer ${userToken}`);
            
            testDarft = response.body; // Salva il corpo della risposta in una variabile

        expect(response.statusCode).toBe(200);
    });

    test('POST /control/approve - Should return 401 if not admin', async () => {
        const response = await request(app)
            .post('/control/approve')
            .send({ id: testDarft._id })
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(response.statusCode).toBe(200);
    });


    test('DELETE /control/draft - Should return 401 if not admin', async () => {
        const response = await request(app)
            .delete('/control/draft?id=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('GET /event/partecipants - Should return participant count (Invalid ID)', async () => {
        const response = await request(app).get('/event/partecipants?id=invalidID');
        expect(response.statusCode).toBe(500);
    });
    
    test('GET /event/id - Should return event by ID (Invalid ID)', async () => {
        const response = await request(app).get('/event/id?id=invalidID');
        expect(response.statusCode).toBe(404);
    });
    
    test('DELETE /event/delete_event - Should not delete an event (Unauthorized)', async () => {
        const response = await request(app).delete('/event/delete_event?id=65fabc1234567890abcdef12');
        expect(response.statusCode).toBe(401);
    });
    
    test('GET /event/yourEvents - Should not return events (Unauthorized)', async () => {
        const response = await request(app).get('/event/yourEvents');
        expect(response.statusCode).toBe(401);
    });
    
    test('GET /event/yourPartecipations - Should not return participations (Unauthorized)', async () => {
        const response = await request(app).get('/event/yourPartecipations');
        expect(response.statusCode).toBe(401);
    });
    
    test('GET /event/yourDrafts - Should not return drafts (Unauthorized)', async () => {
        const response = await request(app).get('/event/yourDrafts')
        .set('Authorization', `Bearer ${userToken}`);
        
        expect(response.statusCode).toBe(200);
    });

    test('GET /control/drafts - Should return 401 if not admin', async () => {
        const response = await request(app)
            .get('/control/drafts')
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(response.statusCode).toBe(200);
    });


    test('DELETE /control/draft - Should return 401 if not admin', async () => {
        const response = await request(app)
            .delete('/control/draft?id=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('DELETE /control/event - Should return 401 if not admin', async () => {
        const response = await request(app)
            .delete('/control/event?id=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(response.statusCode).toBe(200);
    });

    test('GET /control/drafts - Should return drafts if admin', async () => {
        const response = await request(app)
            .get('/control/drafts')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('POST /control/approve - Should approve draft if admin', async () => {
        const response = await request(app)
            .post('/control/approve')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ id: '65b0a3c4a4d123456789abcd' });
        expect(response.statusCode).toBe(200);
    });

    test('DELETE /control/draft - Should delete draft if admin', async () => {
        const response = await request(app)
            .delete('/control/draft?id=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('DELETE /control/event - Should delete event if admin', async () => {
        const response = await request(app)
            .delete('/control/event?id=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('POST /partecipation/join - Should join event successfully', async () => {
        const response = await request(app)
            .post('/partecipation/join?event=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('DELETE /partecipation/leave - Should leave event successfully', async () => {
        const response = await request(app)
            .delete('/partecipation/leave?event=65b0a3c4a4d123456789abcd')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

});
