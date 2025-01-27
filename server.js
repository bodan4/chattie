const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.js');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error("Eroare: JWT_SECRET nu este setat în fișierul .env");
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Înregistrare utilizator
app.post('/register', (req, res) => {
    const { username, password, confirmPassword, email, fullName, phone, birthDate, address } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Parolele nu se potrivesc!' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        `INSERT INTO users (username, password, email, full_name, phone, birth_date, address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, hashedPassword, email, fullName, phone, birthDate, address],
        (err) => {
            if (err) {
                return res.status(400).json({ error: 'Eroare: utilizatorul există deja sau câmpurile sunt invalide.' });
            }
            res.json({ message: 'Înregistrare reușită!' });
        }
    );
});

// Autentificare utilizator
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

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.json({ token });
    });
});

// Servirea fișierelor statice și pornirea serverului
app.get('/chat.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

server.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000');
});
