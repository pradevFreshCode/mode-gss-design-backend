const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

class ConfirmationEmailsSender {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email_confirmation_smtp_host,
            port: config.email_confirmation_smtp_port,
            secure: config.email_confirmation_smtp_secure,
            auth: {
                user: config.email_confirmation_smtp_auth_user,
                pass: config.email_confirmation_smtp_auth_password
            },
            requireTLS: config.email_confirmation_smtp_requireTLS
        });
    }

    generateCodeAndSendToUser(userId) {
        return new Promise((resolve, reject) => {
            User.findById(userId).then(user => {
                if (!user) {
                    reject('User not found');
                }
                if (!user.email) {
                    reject('User has no email');
                }

                this._generateShortCodeAndSaveToDb(user).then(newCode => {
                    this._sendEmail(newCode, user.email, (err, info) => {
                        if (!!err) {
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
                }, err => {
                    reject(err);
                });
            });
        });
    }

    _sendEmail(confirmationCode, email, callback = ()=>{}) {
        this.mailOptions = {
            to: email, // list of receivers
            subject: 'Confirm your email', // Subject line
            html: `<b>Use this short code to confirm your email</b>` +
            `</br>` +
            `<b>${confirmationCode}</b>` // html body
        };

        this.transporter.sendMail(this.mailOptions, callback);
    }

    async _generateShortCodeAndSaveToDb(user) {
        const newCode = ConfirmationEmailsSender._generateCode();
        user.lastActivationCode = newCode;
        await user.save();
        return newCode;
    }

    static _generateCode() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text.toUpperCase();
    }
}

module.exports = ConfirmationEmailsSender;