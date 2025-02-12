const request = require('supertest');
const app = require('./main');
const mongoose = require('mongoose');

var userToken;
var testDraft;
var testEvent;

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
    
    //crea una draft di test
    test('POST /event/create - crea una draft di test', async () => {
        const response = await request(app)
            .post('/event/create')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: "EventoDiTest",
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

    //ritorna le drafts da approvare filtrando per quella di test
    test('GET /control/drafts?title="EventoDiTest" - ritorna le drafts da approvare filtrando per quella di test', async () => {
        const response = await request(app)
            .get('/control/drafts?title=EventoDiTest')
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); // Verifica che sia un array
        expect(response.body.length).toBeGreaterThan(0); // Assicura che non sia vuoto

        testDraft = response.body[0]; // Salva il corpo della risposta in una variabile
    
    });


    //approva la draft di test
    test('POST /control/approve - approva la draft di test', async () => {
        const response = await request(app)
            .post('/control/approve')
            .send({ id: testDraft._id })
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(response.statusCode).toBe(200);
    });


    //ritorna i tuoi eventi
    test('GET /event/yourEvents - ritorna gli eventi da te organizzati', async () => {
        const response = await request(app).get('/event/yourEvents')
        .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });

    //ritorna gli eventi filtrando per quello di test
    test('GET /event/filtered?title=EventoDiTest - ritorna gli eventi filtrando per quello di test', async () => {
        const response = await request(app).get('/event/filtered?title=EventoDiTest');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();

        testEvent = response.body[0]; // Salva il corpo della risposta in una variabile

    });

    //crea una partecipazione all'evento di test
    test('POST /partecipation/join - crea una partecipazione all evento di test', async () => {
        const response = await request(app)
            .post(`/partecipation/join`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event: testEvent });

    
        expect(response.statusCode).toBe(200);
    });

    //crea una partecipazione allo stesso di test
    test('POST /partecipation/join - crea una partecipazione allo stesso di test', async () => {
        const response = await request(app)
            .post(`/partecipation/join`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event: testEvent });

    
        expect(response.statusCode).toBe(400);
    });

    // conta i partecipanti dell'evento di test
    test(`GET /event/partecipants - conta i partecipanti dell evento di test`, async () => {
        const response = await request(app).get(`/event/partecipants?id=${testEvent._id}`); 

        expect(response.statusCode).toBe(200);
        expect(response.body.partecipants).toBe(1);
    });

    //elimina la partecipazione all'evento di test
    test('DELETE /partecipation/leave - elimina la partecipazione all evento di test', async () => {
        const response = await request(app)
            .delete(`/partecipation/leave?event=${testEvent._id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });


    //elimina l'evento di test
    test('DELETE /event/delete_event - elimina l evento di test', async () => {
        const response = await request(app)
        .delete(`/event/delete_event?id=${testEvent._id}`)
        .set('Authorization', `Bearer ${userToken}`);
        expect(response.statusCode).toBe(200);
    });


});
