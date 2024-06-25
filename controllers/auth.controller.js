const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const asynchandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');
const UserModel = require('../models/User.model');
const { performOperation } = require('../redis');


const registerUser = asynchandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const userExist = await UserModel.findOne({ email });

    if (userExist) {
        res.status(400);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
        username,
        email,
        password: hashedPassword
    })

    if (user) {
        res.status(201).json({ _id: user.id, username: user.username, email: user.email });
    }
    else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});

const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Email or Password is missing");
    }
    const user = await UserModel.findOne({ email }).lean();
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user._id
            }
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60m" }
        )
        res.status(200).json({ accessToken })
    }
    else {
        res.status(401);
        throw new Error("Email or password in invalid");
    }
    delete user.password;
    await performOperation("currentUser", JSON.stringify(user), 3600);
})

module.exports = { registerUser, loginUser }



