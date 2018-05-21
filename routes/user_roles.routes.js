const express = require('express');
const router = express.Router();
const UserRole = require('../models/user-role.model');

router.get('/',function(req,res,next){
    UserRole.find().exec().then(roles=>{
        res.respondSuccess(roles);
    });
});

router.post('/',function (req, res, next) {
    throw new Error('Roles creation not allowed');
});

router.get('/:id',function (req, res, next) {
    UserRole.findOne({
        id:req.params.id
    }).then(role=>{
        if(!role)
            next(new Error('role not found'));
        else
            res.respondSuccess(role);
    });
});

router.post('/:id',function (req, res, next) {
    UserRole.findOne({
        id:req.params.id
    }).then(role=>{
        if(!role)
            next(new Error('role not found'));
        else{
            if(!!req.body.name){
                role.name = req.body.name;
                role.save().then(role=>{
                    res.respondUpdated(role)
                });
            }else{
                res.respondSuccess(role);
            }
        }
    });
});

module.exports = router;