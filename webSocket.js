const socketIO = require('socket.io');

const userSocketMap = new Map();
let io;

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "*", // Allow only this origin
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: false
        }
    });



    io.on('connection', socket => {

        socket.on('identify', userId => {
            if (userSocketMap.has(userId)) {
                console.log("User already connected.")
            }
            else {
                userSocketMap.set(userId, socket.id);
                socket.userId = userId;
                console.log(`UserName: ${userId} | socketID: ${socket.id}`);
            }
        });

        socket.on('send', (userId, eventData) => {
            const recipientSocketId = userSocketMap.get(userId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('notification', eventData);                
            } else {
                console.log(`User ${userId} not found or connected`);
            }
        });

        socket.on('privateMessage', ({ recipient, message }) => {
            const recipientSocketId = userSocketMap.get(recipient);
            if (recipientSocketId) {
                io.to(recipient).emit('message', message);
            } else {
                socket.emit('message', `User ${recipient} not found.`);
            }
        });

        socket.on('disconnect', () => {
            for (let [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    console.log(`User ${userId} with socket ${socket.id} disconnected`);
                    userSocketMap.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
}

module.exports = { initializeSocket, userSocketMap };
