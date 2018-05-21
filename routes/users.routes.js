const express = require('express');
const router = express.Router();
const db = require('../models/index');
const Op = require('sequelize/lib/operators');

const validate = require('express-validation');
const usersCreationValidation = require('../validation/users/userCreation');
const usersUpdateValidation = require('../validation/users/userUpdate');
const photoUploadValidation = require('../validation/users/photoUpload');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const userPicturesFolderPath = config.user_pictures_folder_path;
const fs = require('fs');

const UserPictureCreator = require('../classes/userPictureCreator');

router.get('/', function (req, res, next) {
    db.User.findAll({
        include:[db.UserPicture, db.UserRole]
    }).then(models => {
        models.forEach(m=>{
            m.setProfilePhotoUrl();
            m.setCanBeEdited(req.user, db);
        });
        res.sendWithCode(models);
    }, err => {
        res.sendWithCode(err);
    });
});

router.post('/', validate(usersCreationValidation), function (req, res, next) {
    let newUser = db.User.build({
        name: req.body.name,
        login: req.body.login,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id
    });

    newUser.hashPassword(req.body.password);

    newUser.save().then(newUser => {
        newUser.setProfilePhotoUrl();
        newUser.setCanBeEdited(req.user, db);
        res.respondCreated(newUser);
    }, err => {
        next(err);
    });
});

router.get('/:id', function (req, res, next) {
    db.User.findOne({
        where: {
            id: req.params.id
        },
        include: [db.UserPicture, db.UserRole]
    }).then(user => {
        if (!user)
            next(new Error('user not found'));
        else{
            user.setProfilePhotoUrl();
            user.setCanBeEdited(req.user, db);
            res.respondSuccess(user)
        }
    });
});

router.post('/upload-profile-photo', validate(photoUploadValidation), function (req, res) {
    UserPictureCreator.CreateFromBase64Async(req.body.user_id,
        req.body.original_picture_base64,
        req.body.cropped_picture_base64).then(picture=>{
        res.respondCreated(picture);
    }, err => {
        next(err);
    });
});

router.post('/:id', validate(usersUpdateValidation), function (req, res, next) {
    db.User.findOne({
        where: {
            id: req.params.id
        },
        include:[db.UserPicture, db.UserRole]
    }).then(userToUpdate => {
        if (!userToUpdate)
            next(new Error('user not found'));
        else {
            userToUpdate.setCanBeEdited(req.user, db);

            if(!userToUpdate.dataValues.can_be_edited)
                next(new Error('User cannot be changed! Permission denied!'));
            else{
                if (!!req.body.name) userToUpdate.name = req.body.name;
                if (!!req.body.login) userToUpdate.login = req.body.login;
                if (!!req.body.email) userToUpdate.email = req.body.email;
                if (!!req.body.phone) userToUpdate.phone = req.body.phone;
                if (!!req.body.role_id) userToUpdate.role_id = req.body.role_id;

                if (!!req.body.password) userToUpdate.hashPassword(req.body.password);

                userToUpdate.save().then(user => {
                    if (!user)
                        next(new Error('user not found'));
                    else{
                        user.setProfilePhotoUrl();
                        user.setCanBeEdited(req.user, db);
                        res.respondUpdated(user);
                    }
                });
            }
        }
    });
});


router.delete('/:id', function (req, res) {
    db.UserPicture.destroy({
        where: {
            user_id:req.params.id
        }
    }).then(()=>{
        db.User.destroy({
            where: {
                id: req.params.id
            }
        }).then(() => {
            res.respondDeleted();
        })
    });
});

router.post('/:id/checkPassword', function (req, res) {
    if (!req.body.password)
        throw new Error('password to compare not entered');
    else {
        db.User.findOne({
            where: {
                id: req.params.id
            }
        }).then(user => {
            if (!user)
                throw new Error('user not found');

            res.respondSuccess(user.compareHash(req.body.password));
        });
    }
});

module.exports = router;
