const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Address = require("./address.model");
const Origin = require("./origin.model");
const Destination = require("./destination.model");
const Package = require("./package.model");
const Consignment = require("./consignment.model");

const processedShipmentSchema = Schema({
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
    Origin: {type: Schema.Types.ObjectId, ref: 'Origin'},
    Destination: {type: Schema.Types.ObjectId, ref: 'Destination'},
    Packages: [{type: Schema.Types.ObjectId, ref: 'Package'}],
    Consignments: [{type: Schema.Types.ObjectId, ref: 'Consignment'}],
    Commodities: Schema.Types.Mixed,
    IsSaturdayDelivery: Schema.Types.Boolean,
    IsSignatureRequired: Schema.Types.Boolean,
    IsUrgentCouriers: Schema.Types.Boolean,
    DutiesAndTaxesByReceiver: Schema.Types.Boolean,
    DeliveryReference: Schema.Types.String,
    PrintToPrinter: Schema.Types.Boolean,
    Outputs: Schema.Types.Mixed,
    CarrierId: Schema.Types.Number,
    Carrier: Schema.Types.String,
    Service: Schema.Types.String,
    SiteId: Schema.Types.Number,
    IncludeLineDetails: Schema.Types.Boolean,
    ShipType: Schema.Types.Number,
    HasDG: Schema.Types.Boolean,
    DangerousGoods: Schema.Types.Mixed,
    DisableFreightForwardEmails: Schema.Types.Boolean,
    IncludeInsurance: Schema.Types.Boolean,
    CarrierName: Schema.Types.String,
    IsFreightForward: Schema.Types.Boolean,
    IsOvernight: Schema.Types.Boolean,
    IsRural: Schema.Types.Boolean,
    HasTrackPaks: Schema.Types.Boolean,
    Message: Schema.Types.String,
    AddressLabelMessage: Schema.Types.String,
    AddressLabelError: Schema.Types.Mixed,
    Errors: Schema.Types.Array,
    Downloads: Schema.Types.Array,
    CarrierType: Schema.Types.Number,
    AlertPath: Schema.Types.Mixed,
    Notifications: Schema.Types.Array,
    HasSaturdayDeliveryLabel: Schema.Types.Boolean,
    Cost: Schema.Types.Number,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
});

const ProcessedShipment = mongoose.model('ProcessedShipment', processedShipmentSchema);

ProcessedShipment.saveParsedResponseObject = async function (dataToSave, currentUserId) {
    let processedShipmentToSave = new ProcessedShipment();
    Object.assign(processedShipmentToSave, dataToSave, {_id: processedShipmentToSave._id});

    if (dataToSave.Origin) {
        let originToSave = new Origin();
        Object.assign(originToSave, dataToSave.Origin, {_id: originToSave._id});
        if (dataToSave.Origin.Address) {
            let addressToSave = new Address();
            Object.assign(addressToSave, dataToSave.Origin.Address, {_id: addressToSave._id});
            await addressToSave.save();
            originToSave.Address = addressToSave._id;
        }

        await originToSave.save();
        processedShipmentToSave.Origin = originToSave._id;
    }

    if (dataToSave.Destination) {
        let destinationToSave = new Destination();
        Object.assign(destinationToSave, dataToSave.Destination, {_id: destinationToSave._id});
        if (dataToSave.Destination.Address) {
            let addressToSave = new Address();
            Object.assign(addressToSave, dataToSave.Destination.Address, {_id: addressToSave._id});
            await addressToSave.save();
            destinationToSave.Address = addressToSave._id;
        }

        await destinationToSave.save();
        processedShipmentToSave.Destination = destinationToSave._id;
    }

    if (dataToSave.Packages && dataToSave.Packages.length) {
        let packageIdsArray = [];

        for (let i = 0; i < dataToSave.Packages.length; i++) {
            let packageToSave = new Package();
            Object.assign(packageToSave, dataToSave.Packages[i], {_id: packageToSave._id});

            await packageToSave.save();
            packageIdsArray.push(packageToSave._id);
        }
        processedShipmentToSave.Packages = packageIdsArray;
    }

    if (dataToSave.Consignments && dataToSave.Consignments.length) {
        let consignmentsIdsArray = [];

        for (let i = 0; i < dataToSave.Consignments.length; i++) {
            let consignmentToSave = new Consignment();
            Object.assign(consignmentToSave, dataToSave.Consignments[i], {_id: consignmentToSave._id});

            await consignmentToSave.save();
            consignmentsIdsArray.push(consignmentToSave._id);
        }
        processedShipmentToSave.Consignments = consignmentsIdsArray;
    }

    processedShipmentToSave.user = currentUserId;
    await processedShipmentToSave.save();
    return processedShipmentToSave;
};

module.exports = ProcessedShipment;