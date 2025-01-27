const sqlite3 = require('sqlite3').verbose();

// Creăm sau deschidem baza de date users.db
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Eroare la conectarea la baza de date:", err.message);
    } else {
        console.log('Conectat la baza de date SQLite.');
    }
});

// Crearea tabelului "users" dacă nu există
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- Poate fi 'user' sau 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error("Eroare la crearea tabelului users:", err.message);
    } else {
        console.log('Tabelul users a fost creat sau deja există.');
    }
});

// Crearea tabelului "user_details" pentru informații suplimentare
db.run(`
CREATE TABLE IF NOT EXISTS user_details (
    user_id INTEGER PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    date_of_birth DATE,
    bio TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error("Eroare la crearea tabelului user_details:", err.message);
    } else {
        console.log('Tabelul user_details a fost creat sau deja există.');
    }
});

// Crearea tabelului "messages" pentru stocarea mesajelor
db.run(`
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error("Eroare la crearea tabelului messages:", err.message);
    } else {
        console.log('Tabelul messages a fost creat sau deja există.');
    }
});

module.exports = db;
