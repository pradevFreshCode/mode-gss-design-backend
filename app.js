const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ApiRoutes = require('./routes/api.routes');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

mongoose.connect(`mongodb://localhost:27017/${config.mongodb_db_name}`, function (err) {
    if (err) throw err;

    console.log('Mongodb successfully connected');
});

app.use(cors());

app.use(function(req, res, next){
    res.sendWithCode = function(data,statusCode = 200,statusText = 'success'){
        res.status(statusCode).send({status:statusText, data:data});
    };

    res.respondSuccess = function(data){
        res.sendWithCode(data,200,'success');
    };

    res.respondCreated = function(data){
        res.sendWithCode(data,201,'created');
    };

    res.respondUpdated = function(data){
        res.sendWithCode(data,200,'updated');
    };

    res.respondDeleted = function(data){
        res.sendWithCode(data,200,'deleted');
    };

    res.respondError = function(data){
        res.sendWithCode(data,500,'Server error');
    };

    next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', ApiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.sendWithCode(res.locals.message,err.status || 500,'error');
});

module.exports = app;
