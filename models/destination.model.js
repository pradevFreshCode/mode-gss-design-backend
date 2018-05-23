const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const destinationSchema = Schema({
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
    DeliveryInstructions: Schema.Types.String,
    IsRural: Schema.Types.Boolean,
    SendTrackingEmail: Schema.Types.Boolean
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;