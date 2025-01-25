const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authenticateJWT = require('./middlewares/authenticateJWT');
const Event = require('./modules/event.module');
const Record = require('./modules/record.module');
const Partecipation = require('./modules/partecipation.module');
const Organization = require('./modules/organizations.module');
const cron = require('node-cron');


const app = express();
app.use(express.json());

// Connessione al database MongoDB
const password=process.env.PASSWORD;
const user=process.env.USER;
console.log(password);
console.log(user);

const uri = `mongodb+srv://${user}:${password}@groupappdb.61rl9.mongodb.net/?tls=true&authSource=admin`;
console.log(uri);

mongoose.connect(uri)
.then(() => {
  console.log("MongoDB connesso per eventi");
})
.catch(error => {
  console.error("Errore di connessione a MongoDB:", error.message);
});



app.use(cors());

// Importa le route
const registrationRoute = require('./routes/registration.route');
app.use('/registration',registrationRoute);

const accessRoute = require('./routes/access.route');
const { title } = require('process');
app.use('/access', accessRoute);

app.use(authenticateJWT);


const eventRoute = require('./routes/event.route');
app.use('/eventi', eventRoute);

// Importa la route per il controllo
const controlRoute = require('./routes/control.route');
app.use('/control', controlRoute);

// Importa la route per le partecipazioni
const partecipationRoute = require('./routes/partecipation.route');
app.use('/partecipation', partecipationRoute);



// Importa la nuova route per il logout
const logoutRoute = require('./routes/logout.route');  // Import the logout route
app.use('/logout', logoutRoute);  // Map it to /logout



// Middleware per gestire errori 404
app.use((req, res, next) => {
    const err = new Error("Pagina non trovata");
    err.status = 404;
    next(err);
});

// Middleware globale per gestione errori
app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        error: {
            status: err.status || 500,
            message: err.message || "Errore interno del server"
        }
    });
});

//elimina gli eventi vecchi, funziona????
async function deleteOldEvents() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Imposta l'orario di oggi alle 00:00
        const oldEvents = await Event.find({ date: { $lt: today } });


        if(oldEvents>0){

            const Record =[];

            for(const event of oldEvents){

                Record.push({
                    title: event.title,
                    date: event.date,
                    location: event.location,
                    price: event.price,
                    target: event.target,
                    category: event.category,
                    description: event.description,
                    max_subs: event.max_subs,
                    subs: await partecipants(event._id),
                    orgnizer: await organizer(event._id)
                })
            }
        }

        const result = await Event.deleteMany({ date: { $lt: today } });

    } catch (error) {
        console.error("Errore durante l'eliminazione degli eventi:", error.message);
    }


}


//chiama deleteOldEvents ogni giorno a mezzanotte
cron.schedule('0 0 * * *', () => {
    console.log("pulizia eventi");
    deleteOldEvents();
});

//ritorna il numero di parteciapnti all evento
async function partecipants(id){

    const participantsCount = await Partecipation.countDocuments({ event_id });
    
    return participantsCount;
}

//ritorna l id dell organizzatore di un evento
async function organizer(id){

    const organizationRecord = await Organization.findOne({ eventID: eventId });

    return organizationRecord.userID;
}

// Endpoint principali
 app.get('/', (req, res) => {
    console.log("URL richiesto:", req.url);
    console.log("Metodo HTTP:", req.method);
    res.send("Benvenuto nell'API per gli eventi");
});

app.post('/token_access', async (req, res) => {
    res.send("Utente loggato tramite token");
});

app.post('/access', (req,res) =>{
    res.send("Utente loggato");
});

app.post('/registration', async (req, res) => {
    res.send("Utente creato");
});

/*
app.post('/eventi', (req, res) => {
    // Endpoint per la creazione di un nuovo evento
    res.send("Evento creato");
});*/

app.delete('/eventi', (req, res) => {
    // Endpoint per la cancellazione di un evento
    res.send("Evento eliminato");
});

// Avvio del server
app.listen(3000, () => {
    console.log("Server avviato su porta 3000");
});
 