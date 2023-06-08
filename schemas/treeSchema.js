const Joi = require("joi");

const createTreeSchema = Joi.object().keys({
    name: Joi.string().min(0).required(),
    skin_id: Joi.number().integer(),
    is_leaf_falls: Joi.bool()
});

const updateTreeSchema = Joi.object().keys({
    name: Joi.string().min(0),
    skin_id: Joi.number().integer(),
    is_leaf_falls: Joi.bool(),
});

module.exports = {
    '/': createTreeSchema,
    '/:id': updateTreeSchema
};