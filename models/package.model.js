const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const packageSchema = Schema({
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
    Id: Schema.Types.Number,
    Unit: Schema.Types.Number,
    Height: Schema.Types.Number,
    Length: Schema.Types.Number,
    Width: Schema.Types.Number,
    Kg: Schema.Types.Number,
    Name: Schema.Types.String,
    Title: Schema.Types.String,
    PackageCode: Schema.Types.String,
    Type: Schema.Types.String,
    Description: Schema.Types.String,
    Price: Schema.Types.Number
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;