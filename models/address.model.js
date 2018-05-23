const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = Schema({
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
    BuildingName: Schema.Types.String,
    StreetAddress: Schema.Types.String,
    Suburb: Schema.Types.String,
    City: Schema.Types.String,
    PostCode: Schema.Types.String,
    CountryCode: Schema.Types.String
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;