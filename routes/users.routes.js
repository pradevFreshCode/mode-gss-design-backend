const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const usersCreationValidation = require('../validation/users/userCreation');
const usersUpdateValidation = require('../validation/users/userUpdate');

const env = process.env.NODE_ENV || 'development';
const User = require('../models/user.model');
const ConfirmationEmailsSender = require('../classes/confirmationEmailsSender');

router.get('/', function (req, res, next) {
    User.find().populate('role').then(models => {
        res.respondSuccess(models);
    }, err => {
        res.sendWithCode(err);
    });
});

router.post('/', validate(usersCreationValidation), function (req, res, next) {
    let newUser = new User({
        firstName: req.body.firstName,
        secondName: req.body.secondName,
        login: req.body.login,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id
    });

    newUser.setPassword(req.body.password);

    newUser.save().then(newUser => {
        res.respondCreated(newUser);
    }, err => {
        next(err);
    });
});

router.get('/:id', function (req, res, next) {
    User.findById(req.params.id).populate('roles').then(user => {
        if (!user)
            next(new Error('user not found'));
        else{
            res.respondSuccess(user)
        }
    });
});

router.post('/:id', validate(usersUpdateValidation), function (req, res, next) {
    User.findById(req.params.id).then(userToUpdate => {
        if (!userToUpdate)
            next(new Error('user not found'));
        else {
            if (!!req.body.name) userToUpdate.name = req.body.name;
            if (!!req.body.login) userToUpdate.login = req.body.login;
            if (!!req.body.email) userToUpdate.email = req.body.email;
            if (!!req.body.phone) userToUpdate.phone = req.body.phone;
            if (!!req.body.role_id) userToUpdate.role_id = req.body.role_id;

            if (!!req.body.password) userToUpdate.setPassword(req.body.password);

            userToUpdate.save().then(user => {
                if (!user)
                    next(new Error('Error occurred when update user'));
                else{
                    res.respondUpdated(user);
                }
            });
        }
    });
});


router.delete('/:id', function (req, res) {
    User.remove({
        id: req.params.id
    }).then(() => {
        res.respondDeleted();
    })
});

router.get('/confirm_email/:id', function (req, res) {
    const codeSender = new ConfirmationEmailsSender();

    codeSender.generateCodeAndSendToUser(req.params.id).then(sendInfo => {
        res.respondSuccess(sendInfo);
    }, err => {
        res.respondError(err);
    })
});

router.post('/confirm_email/:id', function (req, res, next) {
    User.findById(req.params.id).then(user => {
        if (!user.lastActivationCode || user.lastActivationCode !== req.body.confirmationCode) {
            next(new Error('Confirmation code incorrect!'));
        } else {
            user.lastActivationCode = null;
            user.confirmedAt = Date.now();
            user.save((err, savedUser) => {
                if (!err) {
                    res.respondUpdated(savedUser);
                }
            });
        }
    }, err => {
        next(err);
    });
});

module.exports = router;
