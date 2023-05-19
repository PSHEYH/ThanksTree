const Joi = require("joi");

const createSchema = Joi.object().keys({
    tree_id: Joi.string().required(),
    question: Joi.string().min(0),
    gratitude: Joi.string().required(),
    photos: Joi.string().min(0),
    user_ids: Joi.array().items(Joi.string())
});

module.exports = {
    '/': createSchema,
};