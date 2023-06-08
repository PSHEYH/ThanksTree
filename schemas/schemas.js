const Joi = require('joi');


const loginSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(7).max(30).required(),
    fcm_token: Joi.string().min(50).max(250),
    lang: Joi.string().min(0).max(5),
    name: Joi.string().min(1).max(40),
    avatar: Joi.string().min(1).max(100)
});

const loginAppleSchema = Joi.object().keys({
    identity_token: Joi.string().min(0).required(),
    client_id: Joi.string().max(80).required(),
    fcm_token: Joi.string().min(50).max(250),
    lang: Joi.string().min(0).max(5),
    name: Joi.string().min(1).max(40),
    avatar: Joi.string().min(1).max(100)
});

const loginGoogleSchema = Joi.object().keys({
    client_token: Joi.string().required(),
    fcm_token: Joi.string().min(50).max(250),
    lang: Joi.string().min(0).max(5),
    name: Joi.string().min(1).max(40),
    avatar: Joi.string().min(1).max(100)
});

const refreshTokenSchema = Joi.object().keys({
    refresh_token: Joi.string().required()
});

const updateProfile = Joi.object().keys({
    name: Joi.string().min(2).max(40),
    fcm_token: Joi.string().min(50).max(280),
    lang: Joi.string().max(5),
    avatar: Joi.string().min(0).max(100),
    is_notify: Joi.boolean()
});

module.exports = {
    '/auth/login': loginSchema,
    '/auth/loginGoogle': loginGoogleSchema,
    '/auth/loginApple': loginAppleSchema,
    '/auth/refreshToken': refreshTokenSchema,
    '/profile': updateProfile
};