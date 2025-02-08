const blacklist = new Map();

// Function to add a token to the blacklist
function addToBlacklist(token, expiresAt) {
    blacklist.set(token, expiresAt);
    console.log("Token added to blacklist:", token);
}

// Function to check if a token is blacklisted
function isBlacklisted(token) {
    const expiration = blacklist.get(token);
    if (expiration && Date.now() < expiration) {
        return true; // Token is blacklisted and not expired
    }
    if (expiration && Date.now() > expiration) {
        blacklist.delete(token); // Clean up expired tokens
    }
    return false; // Token is not blacklisted
}

// Export the functions
module.exports = { addToBlacklist, isBlacklisted };