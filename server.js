const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { validateToken } = require('./middlewares/auth.middleware');
const { initializeSocket } = require('./webSocket')

dotenv.config();

const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const postRouter = require('./routes/post.router');

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
    .then(() => {
        console.log('Connected to DB');

        const server = require('http').createServer(app);
        initializeSocket(server)
        console.log("Websocket Connected");

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch(() => {
        console.log('Connection failed');
    });

app.use('/api/auth', authRouter);
app.use('/api/user', validateToken, userRouter);
app.use('/api/post', validateToken, postRouter);