const mongoose = require("mongoose");

const invitedGuestPassesSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Please provide and ID..."],
        unique: false
    },
    residentFirstName: {
        type: String,
        required: [true, "Please provide the resident's first name..."],
        unique: false
    },
    residentLastName: {
        type: String,
        required: [true, "Please provide the resident's last name..."],
        unique: false
    },
    residentEmail: {
        type: String,
        required: [true, "Please provide the resident's email..."],
        unique: false
    },
    invitedGuestId: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Please provide and ID..."],
        unique: false
    },
    invitedGuestName: {
        type: String,
        required: [true, "Please provide the guest's name..."],
        unique: false
    },
    invitedGuestNumber: {
        type: String,
        required: [true, "Please provide the guest's phone number..."],
        unique: false
    },
    invitedGuestPassScanned: {
        type: Boolean,
        required: [true, "Please provide if the pass has been scanned..."],
        unique: false
    },
    invitedGuestPassSent: {
        type: Boolean,
        required: [true, "Please provide if the pass has been sent..."],
        unique: false
    },
})


const passesSchema = new mongoose.Schema({
    passDate: {
        type: String,
        required: [true, "Please give date of visit..."],
        unique: true
    },
    invitedGuestPass: {
        invitedGuestPass: [invitedGuestPassesSchema],
        type: Array,
        required: [true, "Please give list of invited guests..."],
        unique: false
    },
})



module.exports = mongoose.model.Passes || mongoose.model("Passes", passesSchema);