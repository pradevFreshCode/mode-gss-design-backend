const Joi = require('joi');

module.exports = {
    body: {
        name: Joi.string().required(),
        login: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email()
    }
};