const Joi = require("joi");

const createSchema = Joi.object().keys({
    tree_id: Joi.string().required(),
    question: Joi.string().min(0),
    gratitude: Joi.string().required().min(0).max(700),
    photos: Joi.string().min(0),
    user_ids: Joi.array().items(Joi.string()),
    created_at: Joi.string().min(0)
});

const updateSchema = Joi.object().keys({
    gratitude: Joi.string().min(0),
    photos: Joi.string().min(0),
    user_ids: Joi.array().items(Joi.string()),
    created_at: Joi.string().min(0)
});

module.exports = {
    '/': createSchema,
    '/:id': updateSchema
};