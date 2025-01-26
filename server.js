const express = require('express');
const bcrypt = require('bcryptjs'); // Înlocuiește bcrypt cu bcryptjs
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config(); // Importă dotenv pentru a citi fișierul .env

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error("Eroare: JWT_SECRET nu este setat în fișierul .env");
    process.exit(1); // Oprește aplicația dacă variabila nu este setată
}


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new sqlite3.Database('./users.db');

// Creare tabel utilizatori
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Înregistrare
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        (err) => {
            if (err) {
                return res.status(400).json({ error: 'Utilizatorul există deja.' });
            }
            res.json({ message: 'Înregistrare reușită!' });
        }
    );
});

// Autentificare
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Nume utilizator sau parolă incorectă.' });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Nume utilizator sau parolă incorectă.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token });
    });
});

// Socket.io pentru chat
let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('user_connected', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('users', Object.values(onlineUsers));
    });

    socket.on('private_message', ({ to, message }) => {
        const socketId = Object.keys(onlineUsers).find((key) => onlineUsers[key] === to);
        if (socketId) {
            io.to(socketId).emit('private_message', { from: onlineUsers[socket.id], message });
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('users', Object.values(onlineUsers));
    });
});

server.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000');
});
