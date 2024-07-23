const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');
function setupClient(userId) {

    socket.on('connect', () => {
        console.log('Connected to server');
        // socket.emit('message', 'Hello server!');
        socket.emit('identify', userId)
    });

    socket.on('notification', (notification) => {
        console.log('Notification:', notification)
    });

}

function sendNotification(userId, eventType, eventData) {
    socket.emit(eventType, userId, eventData);
}
module.exports = { setupClient, sendNotification };