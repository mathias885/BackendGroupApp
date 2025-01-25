const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || null;
const { isBlacklisted } = require('../modules/blacklist.module'); // Import the shared blacklist module

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET non definito! Assicurati di avere una chiave segreta nel file .env");
}

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    // List of exempted routes
    const exemptedRoutes = ['/registration', '/access'];

    // Check if the current route is exempted
    if (exemptedRoutes.some(route => req.path.startsWith(route))) {
        console.log("Token check avoided for route:", req.path);
        return next();
    }


    // Verifica se l'intestazione di autorizzazione è presente
    if (!authHeader) {
        return res.status(401).json({ message: 'Autorizzazione mancante -+-' });
    }

    // Estrae il token dal formato "Bearer <token>"
    const token = authHeader.split(' ')[1]; 

    // Check if the token is blacklisted
    if (isBlacklisted(token)) {
        return res.status(401).json({ message: 'Token non valido: il token è stato revocato' });
    }

    // Verifica il token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token non valido', error: err.message });
        }

        // Aggiunge i dati decodificati dell'utente alla richiesta
        req.user = user;

        // Log di debugging
        console.log("Token valido per l'utente:", user);

        // Passa alla prossima funzione o route
        next();
    });
}

module.exports = authenticateJWT;

