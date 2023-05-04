const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const userRouter = require('./routes/usersRoute');
const treeRouter = require('./routes/treeRoute');
const appreciationRouter = require('./routes/appreciationRoute');
const errorHandler = require('./handlers/errorHandler');

const app = express();

app.use(express.json({ limit: '20kb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/trees', treeRouter);
app.use('/api/v1/appreciations', appreciationRouter);

var accessLogStream = fs.createWriteStream(path.join(__dirname + "/logs", 'access.log'), { flags: 'a' })

app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

app.use(errorHandler);

module.exports = app;
