const Joi = require('joi');

module.exports = {
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        login: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email()
    }
};