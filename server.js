const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const { default: mongoose } = require('mongoose');
const { validateToken } = require('./middlewares/auth.middleware')

const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const postRouter = require('./routes/post.router');

const app = express();
app.use(express.json());

let PORT = process.env.PORT;

const url = process.env.DB_URL;
mongoose.connect(url)
    .then(() => {
        console.log("Connected to DB");
        app.listen(PORT, () => {
            console.log(`Server running in port ${PORT}`);
        })
    })
    .catch(() => {
        console.log("Connection failed");
    })

app.use("/api/auth", authRouter)
app.use("/api/user", validateToken, userRouter)
app.use("/api/post", validateToken, postRouter)
