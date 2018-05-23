const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const consignmentSchema = Schema({
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
    Connote: Schema.Types.String,
    TrackingUrl: Schema.Types.String,
    Cost: Schema.Types.Number,
    CarrierType: Schema.Types.Number,
    IsSaturdayDelivery: Schema.Types.Boolean,
    IsRural: Schema.Types.Boolean,
    IsOvernight: Schema.Types.Boolean,
    HasTrackPaks: Schema.Types.Boolean,
    ConsignmentId: Schema.Types.Number,
    OutputFiles: Schema.Types.Boolean,
    Items: Schema.Types.Array
});

const Consignment = mongoose.model('Consignment', consignmentSchema);

module.exports = Consignment;