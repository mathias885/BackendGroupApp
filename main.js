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

const uri = `mongodb+srv://${user}:${password}@groupappdb.61rl9.mongodb.net/?tls=true&authSource=admin`;

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
app.use('/event', eventRoute);

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

        if (oldEvents.length > 0) {

            // Proviamo a creare i record prima di eliminare gli eventi
            for (const event of oldEvents) {
                try {
                    // Creazione dei record per ogni evento
                    const record = new Record({
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        price: event.price,
                        target: event.target,
                        category: event.category,
                        description: event.description,
                        max_subs: event.max_subs,
                        subs: await partecipants(event._id), // Assicurati che questa funzione ritorni i dati correttamente
                        orgnizer: await organizer(event._id)  // Assicurati che questa funzione ritorni i dati correttamente
                    });

                    record.save(); // Aggiungi il record all'array

                } catch (err) {
                    // Se si verifica un errore durante la creazione del record, restituisci un errore
                    throw new Error(`Errore durante la creazione del record per l'evento con ID ${event._id}: ${err.message}`);
                }
            }

            // Se arriviamo qui, significa che tutti i record sono stati creati correttamente
            // Ora possiamo procedere con l'eliminazione degli eventi
            const result = await Event.deleteMany({ date: { $lt: today } });
            console.log(`Eventi eliminati: ${result.deletedCount}`);
            
            // Qui puoi aggiungere il salvataggio dei record se necessario
            // ad esempio, salvarli in una collezione separata o inviarli a un sistema di archiviazione
            // await saveRecords(Record);

        } else {
            console.log("Nessun evento da eliminare.");
        }
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

    const participantsCount = await Partecipation.countDocuments({ eventID:id });
    
    return participantsCount;
}

//ritorna l id dell organizzatore di un evento
async function organizer(id){

    const organizationRecord = await Organization.findOne({ eventID: id });

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


// per deploy
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
  

// Avvio del server in locale
//app.listen(3000, () => {
 //   console.log("Server avviato su porta 3000");
//});
 
module.exports = app; // Esporta `app` per i test
