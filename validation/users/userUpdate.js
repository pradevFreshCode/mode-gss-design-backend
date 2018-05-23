const Joi = require('joi');

module.exports = {
    body: {
        firstName: Joi.string(),
        lastName: Joi.string(),
        login: Joi.string(),
        email: Joi.string().email()
    }
};