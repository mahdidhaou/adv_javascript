console.log('Hello Wolrd !');
require('dotenv').config()
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session')
const process = require('process');

// Printing process.pid property value
try {
    console.log(process.env.MONGODB)
    mongoose.connect(process.env.MONGODB);
    console.log("Connected to the db");
} catch (error) {
    console.error('Can\'t connect to the db');
}

const GameRoutes = require('./routes/game');
const WordRoutes = require('./routes/word');
const AuthRoutes = require('./routes/auth');
const UserRoutes = require('./routes/user');

const App = express();
App.use(helmet());
App.use(morgan('common'));
App.use(express.json());
App.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true
    }
}));

App.get('/', (request, response) => {
    return response.status(200).send('<h1>It works From GET !</h1>');
});

App.post('/', (request, response) => {
    return response.status(200).send('<h1>It works from POST !</h1>');
});

App.use('/game', GameRoutes);
App.use('/word', WordRoutes);
App.use('/auth', AuthRoutes);
App.use('/user', UserRoutes);

App.listen(process.env.PORT, () => {
    console.log("process id is " + process.pid);
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});