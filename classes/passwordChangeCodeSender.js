const User = require('../models/user.model');
const InfoEmailSender = require('../classes/infoEmailSender');
const ShortCodeGenerator = require('../classes/shortCodeGenerator')

class PasswordChangeCodeSender {
    constructor() {
        this.sender = new InfoEmailSender();
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
            subject: 'Your short code to change pass', // Subject line
            html: `<b>Enter this short code to confirm, that you realy want change your password</b>` +
            `</br>` +
            `<b>${confirmationCode}</b>` // html body
        };

        this.sender.send(this.mailOptions, callback);
    }

    async _generateShortCodeAndSaveToDb(user) {
        const newCode = ShortCodeGenerator._generateCode();
        user.lastPasswordChangeCode = newCode;
        await user.save();
        return newCode;
    }
}

module.exports = PasswordChangeCodeSender;