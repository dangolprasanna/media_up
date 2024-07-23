const socketIO = require('socket.io');

const userSocketMap = new Map();
let io;

function initializeSocket(server) {
    io = socketIO(server);

    io.on('connection', socket => {

        socket.on('identify', userId => {
            userSocketMap.set(userId, socket.id);
            socket.userId = userId;
            console.log(`UserName: ${userId} | socketID: ${socket.id}`);
        });

        socket.on('follow', (userId, eventData) => {
            const recipientSocketId = userSocketMap.get(userId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('notification', eventData);
                console.log(`Follow notification sent to user ${userId}`);
            } else {
                console.log(`User ${userId} not found`);
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

// function emitEventToUser(userId, eventType, eventData) {
//     // const socketId = userSocketMap.get(userId);

//     // if (socketId) {
//         io.to(userId).emit(eventType, eventData);
//     // } else {
//     //     console.log(`User ${userId} not connected.`);
//     // }
// }

module.exports = { initializeSocket, userSocketMap };
