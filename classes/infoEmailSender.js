const nodemailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

class InfoEmailSender{
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

    send(mailOptions, cb) {
        this.transporter.sendMail(mailOptions, cb);
    }
}

module.exports = InfoEmailSender;