const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connessione al database MongoDB
const password=process.env.PASSWORD;
console.log(password);

const uri = `mongodb+srv://leonerder:${password}@groupappdb.61rl9.mongodb.net/?tls=true&authSource=admin`;
console.log(uri);

mongoose.connect(uri)
.then(() => {
  console.log("MongoDB connesso per eventi");
})
.catch(error => {
  console.error("Errore di connessione a MongoDB:", error.message);
});



app.use(cors());

// Importa la route per gli eventi
const eventRoute = require('./routes/event.route');
app.use('/eventi', eventRoute);

// Importa la route per il controllo
const controlRoute = require('./routes/control.route');
app.use('/control', controlRoute);

// Importa la route per le partecipazioni
const partecipationRoute = require('./routes/partecipation.route');
app.use('/partecipation', partecipationRoute);

const registrationRoute = require('./routes/registration.route');
app.use('/registration', registrationRoute);

const accessRoute = require('./routes/access.route');
app.use('/access', accessRoute);


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

// Endpoint principali
app.get('/', (req, res) => {
    console.log("URL richiesto:", req.url);
    console.log("Metodo HTTP:", req.method);
    res.send("Benvenuto nell'API per gli eventi");
});

app.post('/access', (req,res) =>{
    res.send("Utente loggato");
});

app.post('/registration', async (req, res) => {
    res.send("Utente creato");
});


app.post('/eventi', (req, res) => {
    // Endpoint per la creazione di un nuovo evento
    res.send("Evento creato");
});

app.delete('/eventi', (req, res) => {
    // Endpoint per la cancellazione di un evento
    res.send("Evento eliminato");
});

// Avvio del server
app.listen(3000, () => {
    console.log("Server avviato su porta 3000");
});
