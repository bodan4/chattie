// const socket = io();

// const form = document.getElementById('chat-form');
// const input = document.getElementById('message-input');
// const messages = document.getElementById('messages');
// const usersList = document.getElementById('users-list');

// let currentUser = null;
// let targetUser = null;

// // Înregistrare utilizator
// const username = prompt('Introdu numele tău:');
// socket.emit('register', username);
// currentUser = username;

// // Actualizează lista utilizatorilor conectați
// socket.on('users', (users) => {
//     usersList.innerHTML = '';
//     for (const id in users) {
//         if (id !== socket.id) { // Exclude utilizatorul curent
//             const userItem = document.createElement('li');
//             userItem.textContent = users[id];
//             userItem.dataset.id = id;
//             userItem.classList.add('user-item');
//             userItem.addEventListener('click', () => {
//                 targetUser = id;
//                 alert(`Ai selectat să vorbești cu ${users[id]}`);
//             });
//             usersList.appendChild(userItem);
//         }
//     }
// });

// // Trimiterea mesajelor private
// form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     if (input.value && targetUser) {
//         socket.emit('private_message', { to: targetUser, message: input.value });
//         const item = document.createElement('div');
//         item.textContent = `Tu: ${input.value}`;
//         messages.appendChild(item);
//         input.value = '';
//     } else {
//         alert('Selectează un utilizator înainte de a trimite un mesaj.');
//     }
// });

// // Afișează mesajele primite
// socket.on('private_message', ({ from, message }) => {
//     const item = document.createElement('div');
//     item.textContent = `${from}: ${message}`;
//     messages.appendChild(item);
// });

const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('users-list');

let currentUser = null;
let targetUser = null;

// Înregistrare utilizator
const username = prompt('Introdu numele tău:');
socket.emit('register', username);
currentUser = username;

// Actualizează lista utilizatorilor conectați
socket.on('users', (users) => {
    usersList.innerHTML = '';
    for (const id in users) {
        if (id !== socket.id) { // Exclude utilizatorul curent
            const userItem = document.createElement('li');
            userItem.textContent = users[id];
            userItem.dataset.id = id;
            userItem.classList.add('user-item');
            userItem.addEventListener('click', () => {
                targetUser = id;
                alert(`Ai selectat să vorbești cu ${users[id]}`);
            });
            usersList.appendChild(userItem);
        }
    }
});

// Trimiterea mesajelor private
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && targetUser) {
        socket.emit('private_message', { to: targetUser, message: input.value });
        const item = document.createElement('div');
        item.textContent = `Tu: ${input.value}`;
        messages.appendChild(item);
        input.value = '';
    } else {
        alert('Selectează un utilizator înainte de a trimite un mesaj.');
    }
});

// Afișează mesajele primite
socket.on('private_message', ({ from, message }) => {
    const item = document.createElement('div');
    item.textContent = `${from}: ${message}`;
    messages.appendChild(item);
});
