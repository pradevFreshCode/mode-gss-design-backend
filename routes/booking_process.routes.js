const express = require('express');
var querystring = require('querystring');
var http = require('http');
const router = express.Router();

const validate = require('express-validation');
const pickupValidation = require('../validation/pickup.validation');

const passport = require("passport");
const JWTStrategyPassportProvider = require('../classes/JWTStrategyPassportProvider');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const ProcessedShipment = require('../models/processed-shipment.model');

passport.use(JWTStrategyPassportProvider.provide());

router.post('/pickup', function (req, res, next) {
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

            if (matches && matches.length) {
                const outcomeMessage = matches[1];
                if (outcomeMessage) {
                    res.respondSuccess(outcomeMessage.trim());
                } else {
                    res.respondError('Something went wrong');
                }
            } else if (responseString.includes('We’re sorry — something has gone wrong on our end.')) {
                res.respondError('API respond error');
            } else {
                res.respondError('Something went wrong');
            }

        });
    });

    postReq.write(postData);
    postReq.end();
});

router.post('/post_shipments', JWTStrategyPassportProvider.authorizeIfAuthHeaderExits, function (req, res, next){
    const shipmentRequestObject = removeServiceFields(req.body.shipmentRequest);

    // res.respondSuccess(shipmentRequestObject);

    const postData = JSON.stringify(shipmentRequestObject);
    const postOptions = {
        host: config.gosweetspotApiUrl,
        port: '80',
        path: `/api/shipments`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'access_key': config.gosweetspotApiAccessKey
        }
    };

    const postReq = http.request(postOptions, function (response) {
        let responseString = "";

        response.on("data", function (data) {
            responseString += data;
        });
        response.on("end", function () {
            console.log(responseString);
            const responseObject = JSON.parse(responseString.trim());

            const dataToSave = Object.assign({}, shipmentRequestObject, responseObject);
            if (!!req.user) {
                ProcessedShipment.saveParsedResponseObject(dataToSave, req.user._id).then(savedData => {
                    ProcessedShipment.findById(savedData._id)
                        .populate({
                            path: 'Origin',
                            populate: {path: 'Address'}
                        })
                        .populate({
                            path: 'Destination',
                            populate: {path: 'Address'}
                        })
                        .populate({
                            path: 'user',
                            populate: {path: 'role'}
                        })
                        .populate('Packages')
                        .populate('Consignments').then(shipment => {
                        if (!shipment)
                            next(new Error('shipment not found'));
                        else
                            res.respondSuccess(shipment);
                    });
                }, err => {
                    next(err);
                });
            } else {
                res.respondSuccess(dataToSave);
            }
        });
    });

    postReq.write(postData);
    postReq.end();
});

module.exports = router;


function removeServiceFields(object) {
    if (object.hasOwnProperty('_id')) {
        delete object._id;
    }
    if (object.hasOwnProperty('Id')) {
        delete object.Id;
    }
    Object.keys(object).forEach(key => {
        if(object[key] && typeof object[key] === 'object') {
            object[key] = removeServiceFields(object[key]);
        }
    });

    return object;
}