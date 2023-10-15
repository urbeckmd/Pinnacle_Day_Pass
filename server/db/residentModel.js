const mongoose = require("mongoose");

const invitedGuestSchema = new mongoose.Schema({
    invitedGuestName: {
        type: String,
        required: [true, "Please provide the guest's name..."],
        unique: false
    },
    invitedGuestNumber: {
        type: String,
        required: [true, "Please provide the guest's phone number..."],
        unique: [true, "Phone number has already been invited..."]
    },
    invitedGuestDateOfVisit: {
        type: Date,
        required: [true, "Please provide the date of the visit..."],
        unique: false
    },
    invitedGuestPassScanned: {
        type: Boolean,
        required: [true, "Please provide if the pass has been scanned..."],
        unique: false
    },
})

const savedGuestSchema = new mongoose.Schema({
    savedGuestName: {
        type: String,
        required: [true, "Please provide the saved guest's name..."],
        unique: false
    },
    savedGuestNumber: {
        type: String,
        required: [true, "Please provide the saved guest's number..."],
        unique: [true, "This number is already saved..."]
    }
})

const residentSchema = new mongoose.Schema({
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
        unique: [true, "Email exists..."]
    },
    residentPassword: {
        type: String,
        required: [true, "Please provide a password..."],
        unique: false},
    invitedGuests: {
        invitedGuests: [invitedGuestSchema],
        type: Array,
        required: false,
        unique: false
    },
    savedGuests: {
        savedGuests: [savedGuestSchema],
        type: Array,
        required: false,
        unique: false
    }
});

module.exports = mongoose.model.Residents || mongoose.model("Residents", residentSchema);