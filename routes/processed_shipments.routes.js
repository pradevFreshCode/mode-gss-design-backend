const express = require('express');
const router = express.Router();
const ProcessedShipment = require('../models/processed-shipment.model');

router.get('/', function (req, res, next) {
    ProcessedShipment.find({
        user: req.user._id
    })
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
        .populate('Consignments')
        .exec().then(roles => {
        res.respondSuccess(roles);
    }, err => {
        next(err);
    });
});

router.post('/', function (req, res, next) {
    throw new Error('ProcessedShipment creation not allowed');
});

router.get('/:id', function (req, res, next) {
    ProcessedShipment.findById(req.params.id)
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
});

router.post('/:id', function (req, res, next) {
    throw new Error('ProcessedShipment modifying not allowed');
});

module.exports = router;