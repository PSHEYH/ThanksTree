const fetch = require('node-fetch');
const appleSignIn = require('apple-signin-auth');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const AppError = require('../utils/app.error');

const createToken = (id) =>
    jwt.sign(
        {
            sub: id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 43200,
        },
        process.env.JWT_KEY
    );

const createRefreshToken = (id, refresh_key) => jwt.sign(
    {
        sub: id,
        refresh_key: refresh_key,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800,
    },
    process.env.JWT_KEY
);

const upsertUser = async (updateObject, email) => {

    const [user, created] = await User.upsert(updateObject, {
        where: {
            email: email
        },
        returning: true
    });

    if (!created) {
        const { id } = await User.findOne({
            where: {
                email: email
            },
            attributes: ['id']
        });

        user.dataValues.id = id;
    }
    return user;
}

exports.loginGoogle = catchAsync(async (req, res, next) => {

    const googleResponse = await fetch("https://oauth2.googleapis.com/tokeninfo", {
        method: 'POST',
        body: JSON.stringify({ id_token: req.body.client_token }),
        headers: { 'Content-Type': 'application/json' },
    });

    const googleData = await googleResponse.json();

    if (!googleData.hasOwnProperty('email') || !googleData.hasOwnProperty('email_verified')) {
        return next(new AppError('Google data wrong', 400));
    }
    if (googleData.email_verified === false) {
        return next(new AppError('Email doesnt verified', 400))
    }

    const password = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
    const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);

    const hashPassword = await bcrypt.hash(password, 10);

    delete req.body.client_token;

    let updateObject = {
        ...req.body,
        refresh_key: refreshKey,
        password: hashPassword,
        email: googleData.email,
    };

    const [user, created] = await User.upsert(updateObject, {
        where: {
            email: googleData.email
        },
        returning: true
    });

    if (!created) {
        const { id } = await User.findOne({
            where: {
                email: googleData.email
            },
            attributes: ['id']
        });

        user.dataValues.id = id;
    }

    const token = createToken(user.id);
    const refreshToken = createRefreshToken(user.id, refreshKey);

    res.status(200).json({
        token: token,
        refresh_token: refreshToken,
        expires_in: 43200,
        type: 'Bearer',
    });
});

exports.loginApple = catchAsync(async (req, res, next) => {

    let appleResponse;
    try {
        appleResponse = await appleSignIn.verifyIdToken(req.body.identity_token);
    } catch (error) {
        return next(new AppError('Apple data error', 400));
    }

    if (appleResponse.sub !== req.body.client_id) {
        return next(new AppError('Apple data error', 400));
    };

    const password = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
    const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
    const hashPassword = await bcrypt.hash(password, 10);
    let updateObject = {
        ...req.body,
        password: hashPassword,
        refresh_key: refreshKey,
        email: appleResponse.email
    };

    const user = await upsertUser(updateObject, appleResponse.email);
    const token = createToken(user.id);
    const refreshToken = createRefreshToken(user.id, refreshKey);

    res.status(200).json({
        token: token,
        refresh_token: refreshToken,
        expires_in: 43200,
        type: 'Bearer',
    });
});

exports.login = catchAsync(async (req, res, next) => {

    const { password, email, fcm_token, lang } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
    let updateObject = {};

    if (fcm_token) {
        updateObject["fcm_token"] = fcm_token;
    }
    if (lang) {
        updateObject["lang"] = lang;
    }

    const user = await User.findOne({
        where: {
            email: email
        }
    });
    if (!user) {
        return next(new AppError('User not found', 400));
    }

    if (await bcrypt.compare(hashPassword, user.password)) {
        return next(new AppError('Wrong password', 400));
    }

    await User.update(updateObject, {
        where: {
            email: email
        }
    });

    const token = createToken(user.id);
    const refreshToken = createRefreshToken(user.id, refreshKey);

    res.status(200).json({
        token: token,
        refresh_token: refreshToken,
        expires_in: 43200,
        type: 'Bearer',
    });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    await User.destroy({
        where: {
            id: req.user_id
        }
    });

    res.status(204).json({});
});

exports.refreshToken = catchAsync(async (req, res, next) => {

    const { refresh_token } = req.body;
    let decoded;

    try {
        decoded = await promisify(jwt.verify)(refresh_token, process.env.JWT_KEY);
    } catch (error) {
        return next(new AppError("Invalid token", 401));
    }
    const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
    await User.update({
        refresh_key: refreshKey,
    }, {
        where: {
            id: decoded.sub,
            refresh_key: decoded.refresh_key
        },
    });

    const token = createToken(decoded.sub);
    const refreshToken = createRefreshToken(decoded.sub, refreshKey);


    res.status(200).json({
        token: token,
        refresh_token: refreshToken,
        expires_in: 43200,
        type: 'Bearer',
    });
})