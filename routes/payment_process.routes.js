const express = require('express');
var querystring = require('querystring');
var http = require('http');
const router = express.Router();

const validate = require('express-validation');
const pickupValidation = require('../validation/pickup.validation');

const passport = require("passport");
const JWTStrategyPassportProvider = require('../classes/JWTStrategyPassportProvider');

passport.use(JWTStrategyPassportProvider.provide());

router.post('/pickup',validate(pickupValidation), function (req, res, next) {
    const postData = querystring.stringify({
        'Connote.ConsignmentId' : req.body.ConnoteConsignmentId,
        'Connote.ConsignmentNumber': req.body.ConnoteConsignmentNumber,
        'CloseTime': req.body.CloseTime,
        'Message' : req.body.Message,
        'btnbook' : 'Book Now'
    });

    const postOptions = {
        host: 'ship.gosweetspot.com',
        port: '80',
        path: `/bookpickup/${req.body.SiteId}-${req.body.ConnoteConsignmentNumber}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'ship.gosweetspot.com',
            'Origin': 'https://ship.gosweetspot.com',
            'Referer': `https://ship.gosweetspot.com/bookpickup/${req.body.SiteId}-${req.body.ConnoteConsignmentNumber}`
        }
    };

    const postReq = http.request(postOptions, function (response) {
        let responseString = "";

        response.on("data", function (data) {
            responseString += data;
        });
        response.on("end", function () {
            const regex = /\r*?\n*?Booking Outcome<\/.*?>\r*?\n*?(.*?)\r*?\n*?<\/div>/gm;
            let matches = regex.exec(responseString);

            const outcomeMessage = matches[1];
            if (outcomeMessage) {
                res.respondSuccess(outcomeMessage.trim());
            } else {
                res.respondError('Something went wrong');
            }
        });
    });

    postReq.write(postData);
    postReq.end();
});

module.exports = router;
