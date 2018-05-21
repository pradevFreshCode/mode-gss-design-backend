const Joi = require('joi');

module.exports = {
    body: {
        ConnoteConsignmentId: Joi.number().required(),
        ConnoteConsignmentNumber: Joi.string().required(),
        SiteId: Joi.number().required(),
        CloseTime: Joi.number().required(),
        Message: Joi.string()
    }
};