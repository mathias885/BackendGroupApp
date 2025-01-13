const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || null;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET non definito! Assicurati di avere una chiave segreta nel file .env");
}

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    // Verifica se l'intestazione di autorizzazione è presente
    if (!authHeader) {
        return res.status(401).json({ message: 'Autorizzazione mancante' });
    }

    // Estrae il token dal formato "Bearer <token>"
    const token = authHeader.split(' ')[1]; 

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

