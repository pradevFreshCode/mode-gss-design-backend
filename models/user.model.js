const mongoose = require("mongoose");
const bcrypt = require('bcrypt-nodejs');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const Schema = mongoose.Schema;
const UserRole = require("./user-role.model");

const userSchema = Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: function () { return new mongoose.Types.ObjectId() }
    },
    firstName: String,
    lastName: String,
    email: String,
    login: {
        type: String,
        required: true,
        unique: true,
        dropDups: true},
    password: { type: String, required: true },
    created: {
        type: Date,
        default: Date.now
    },
    role: { type: Schema.Types.ObjectId, ref: 'UserRole' },
    confirmedAt: Schema.Types.Date,
    lastActivationCode: String,
    lastPasswordChangeCode: String
});

userSchema.methods.setPassword = function (newPassword) {
    this.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(config.password_hash_salt_rounds || 10));
};

userSchema.methods.compareHash = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

User._initializeIfEmpty = function() {
    const adminLogin = config.admin_user_login || 'admin';
    User.find({ 'login': adminLogin }).count((err, count) => {
        if (!count) {
            const adminUser = new User({
                firstName: 'Main',
                lastName: 'Administrator',
                login: adminLogin,
                role: UserRole.STATIC_IDS.ADMIN_ROLE_ID
            });

            adminUser.setPassword(config.admin_user_password || 'admin');

            adminUser.save((err, user) => {
                console.log(err);
                if (!err) {
                    console.log('admin user inserted successfully');
                }
            });
        } else {
            console.log('Users table already not empty. Initialization don\'t needed');
        }
    });
};

module.exports = User;