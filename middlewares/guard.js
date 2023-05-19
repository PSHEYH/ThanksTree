const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require("../utils/catchAsync");
const User = require('../models/User');
const AppError = require('../utils/app.error');

const guard = catchAsync(async (req, res, next) => {
    if (!req.headers.authorization) {
        return next(new AppError('Unauthorized', 401));
    }
    if (!req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('Malfored authorization header', 401));
    }

    const token = req.headers.authorization.split(' ')[1];
    let decoded;

    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    } catch (error) {
        return next(new AppError('Jwt expired', 401));
    }

    const user = await User.findByPk(decoded.sub);

    if (!user) {
        return next(new AppError('User not found', 401));
    }

    req.user = {
        id: decoded.sub,
        name: user.name,
        avatar: user.avatar
    };
    next();
});

module.exports = guard;