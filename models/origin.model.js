const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const originSchema = Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: function () {
            return new mongoose.Types.ObjectId()
        }
    },
    created: {
        type: Date,
        default: Date.now
    },
    Id: Schema.Types.String,
    Name: Schema.Types.String,
    Address: {type: Schema.Types.ObjectId, ref: 'Address'},
    ContactPerson: Schema.Types.String,
    PhoneNumber: Schema.Types.String,
    Email: Schema.Types.String,
    IsRural: Schema.Types.Boolean
});

const Origin = mongoose.model('Origin', originSchema);

module.exports = Origin;