const Joi = require("joi");

const createSchema = Joi.object().keys({
    tree_id: Joi.string().required(),
    title: Joi.string().min(3).required(),
    appreciation: Joi.string().min(5).required(),
    photos: Joi.string(),
    user_ids: Joi.array().items(Joi.string())
});

module.exports = {
    '/': createSchema,
};