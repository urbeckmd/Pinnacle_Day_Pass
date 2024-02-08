const bcrypt = require("bcrypt");
const dbConnect = require("./db/dbConnect");
const Resident = require("./db/residentModel");
const Passes = require("./db/passesModel")
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const schedule = require("node-schedule");
const mongoose = require("mongoose");
var QRCode = require('qrcode');
var nodemailer = require('nodemailer');
var moment = require('moment');
const { unlink } = require('node:fs/promises');
const { log } = require("node:console");

dbConnect()
moment().format();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
})

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
    response.json({ message: "Hey! This is your server response!" });
    next();
});


// ensure user login  credentials are correct
app.post("/", (request, response) => {
    Resident.findOne({ residentEmail: request.body.email })
        .then((resident) => {
            bcrypt.compare(request.body.password, resident.residentPassword)
                .then((passwordCheck) => {
                    // if passwords do not match
                    if (!passwordCheck) {
                        return response.status(400).send({
                            message: "Passwords do not match 1",
                            error
                        })
                    }
                    // if username and password are correct
                    const token = jwt.sign(
                        {
                            residentId: resident._id,
                            residentEmail: resident.email,
                        },
                        "1pn8XwAhk2iapj6ThxzyFHZdZ5eTpuMh",
                        { expiresIn: "12h" }
                    );
                    // return email, id, and jwt
                    response.status(200).send({
                        message: "Login Successful",
                        email: resident.residentEmail,
                        residentId: resident._id,
                        residentFirstName: resident.residentFirstName,
                        residentLastName: resident.residentLastName,
                        token,
                    });
                })
                // if passwords do not match
                .catch((error) => {
                    response.status(400).send({
                        message: "Passwords do not match 2",
                        error,
                    });
                })
        })
        // if email is not in database
        .catch((e) => {
            response.status(404).send({
                message: "Email not found",
                e
            });
        });
});


// Retrieve all the invited guests
app.get("/getInvitedGuests", (request, response) => {
    const currentUser = request.query.residentId;
    console.log(currentUser);
    Resident.findOne({ _id: new mongoose.Types.ObjectId(currentUser) })
        .then((result) => {
            const invitedGuests = result.invitedGuests;
            response.status(200).send({
                data: invitedGuests
            })
        })
        .catch((e) => {
            response.status(400).send({
                message: "Resident ID not found in database...",
                e,
            });
        });
})

// Retrieve all the saved guests
app.get("/getSavedGuests", (request, response) => {
    const currentUser = request.query.residentId;
    console.log(currentUser);
    Resident.findOne({ _id: new mongoose.Types.ObjectId(currentUser) })
        .then((result) => {
            const savedGuests = result.savedGuests;
            response.status(200).send({
                data: savedGuests
            })
        })
        .catch((e) => {
            response.status(400).send({
                message: "Email not found in database...",
                e,
            });
        });
})



// Add guest to array of invites guests
app.put("/addGuest", (request, response) => {
    const guestId = new mongoose.Types.ObjectId();
    const date = request.body.guestDateOfVisit;
    const residentEmail = request.body.residentEmail;
    const residentId = new mongoose.Types.ObjectId(request.body.residentId);
    const residentFirstName = request.body.residentFirstName;
    const residentLastName = request.body.residentLastName;
    const guestName = request.body.guestName;
    const guestNumber = request.body.guestNumber;
    var noErrors = true;
    console.log(request.body);

    // Check if date already exists in Passes 
    Passes.findOne({ passDate: date })
        .then((result) => {
            // If date doesnt exist yet, insert the document into the collection
            if (result == null) {
                console.log('Date it not made yet. Creating it now...');
                Passes.create(
                    {
                        passDate: date,
                        invitedGuestPass: [{
                            residentId: residentId,
                            residentFirstName: residentFirstName,
                            residentLastName: residentLastName,
                            residentEmail: residentEmail,
                            invitedGuestId: guestId,
                            invitedGuestName: guestName,
                            invitedGuestNumber: guestNumber,
                            invitedGuestPassScanned: false,
                            invitedGuestPassSent: false
                        }]
                    }
                )
                    .then((result) => {
                        console.log(result);
                        console.log('Successfully created the new date');
                    })
                    .catch((error) => {
                        console.log(error);
                        console.log('Failed to create new date');
                        noErrors = false;
                    })
            }
            // If date already exists, check if the guest was already added or not, then send invite or not.
            else {
                // Get list of all guests for day
                console.log('Date existed. Attempting to add new guest to the date...');
                Passes.updateOne(
                    { passDate: date },
                    {
                        $push: {
                            invitedGuestPass: {
                                residentId: residentId,
                                residentFirstName: residentFirstName,
                                residentLastName: residentLastName,
                                residentEmail: residentEmail,
                                invitedGuestId: guestId,
                                invitedGuestName: guestName,
                                invitedGuestNumber: guestNumber,
                                invitedGuestPassScanned: false,
                                invitedGuestPassSent: false
                            }
                        }
                    }
                )
                    .then((result) => {
                        console.log(result);
                        console.log('Successfully added new guest to the date');
                    })
                    .catch((error) => {
                        console.log(error);
                        console.log('Failed to add new guest to the date');
                        noErrors = false;
                    })
            }

        })
        .catch((e) => {
            console.log(e);
            console.log("Failed to complete find method");
            noErrors = false;
        });



    // Update the Residents Collection
    // if people are already invited on this date, push new guest
    // else push new date with new guest
    if (request.body.dateExists) {
        Resident.updateOne(
            { _id: residentId },
            {
                $push: {
                    "invitedGuests.$[elem].invitedGuestsForDate": {
                        "invitedGuestId": guestId,
                        "invitedGuestName": guestName,
                        "invitedGuestNumber": guestNumber,
                        "invitedGuestPassScanned": false,
                        "invitedGuestPassSent": false
                    }
                }
            },
            { arrayFilters: [{ "elem.date": request.body.guestDateOfVisit }] },
        )
            .then((result) => {
                console.log("Guest was added to existing date in Residents Collections..");
            })
            .catch((error) => {
                noErrors = false
                console.log('Guest was not added to existing date in the Resident Collections...');
            })
    }
    else {
        Resident.updateOne(
            { _id: residentId },
            {
                $push: {
                    "invitedGuests": {
                        'date': request.body.guestDateOfVisit,
                        'invitedGuestsForDate': [{
                            "invitedGuestId": guestId,
                            "invitedGuestName": guestName,
                            "invitedGuestNumber": guestNumber,
                            "invitedGuestPassScanned": false,
                            "invitedGuestPassSent": false
                        }]
                    }
                }
            },
        )
            .then((result) => {
                console.log("Guest was added to new date in Residents Collections..");
            })
            .catch((error) => {
                noErrors = false
                console.log("Guest was not added to new date in Residents Collections..");
            })
    }
    if (noErrors) {
        response.status(200).send({
            message: "Guest was added to all collections..."
        });
    } else {
        response.status(403).send({
            message: "Guest was not added to all collections...",
            error,
        });
    }
})


// Add guest to array of saved guests
app.post("/saveGuest", (request, response) => {
    console.log(request.body);
    Resident.updateOne(
        { _id: new mongoose.Types.ObjectId(request.body.residentId) },
        {
            $addToSet: {
                "savedGuests": {
                    "savedGuestId": new mongoose.Types.ObjectId(),
                    "savedGuestName": request.body.guestName,
                    "savedGuestNumber": request.body.guestNumber,
                }
            }
        },
    )
        .then((result) => {
            response.status(200).send({
                message: "successfully saved the guest",
                result
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "failed to save the guest",
                error
            })
        })
})



// Delete the old passes each morning
const deleteOldPasses = () => {
    const previousDays = moment().subtract(2, 'days').format('YYYY-MM-DD')
    console.log(previousDays);

    Passes.findOneAndDelete(
        { passDate: previousDays }
    )
        .then((result) => {
            console.log('successfully deleted old passes from Passes collection...');
            console.log(result);
            var deletedGuests = result.invitedGuestPass;
            // Delete the QR images for old guests if they exist (do not exist if email was never sent)
            deletedGuests.forEach((guest, index) => {
                try {
                    var guestId = guest.invitedGuestId;
                    unlink(`./qr_code_images/${guestId.toString()}.png`)
                    console.log(`Successfully deleted QR code for ${guestId.toString()}`);
                } catch {
                    console.log("No file found...");
                }
            })
        })
        .catch((error) => {
            console.log('failed to delete old passes from Passes collection...');
        })

    Resident.updateMany(
        {},
        { $pull: { "invitedGuests": { "date": previousDays } } },
    )
        .then((result) => {
            console.log('Successfully deleted old passes from Resident Collection');
            console.log(result);
        })
        .catch((error) => {
            console.log('Error deleting old passes from Resident collection');
            console.log(error);
        })
}


const createQRCode = (invitedGuest) => {
    const passId = invitedGuest.invitedGuestId.toString();
    QRCode.toFile(`./qr_code_images/${passId}.png`, passId, function (err, response) {
        if (err) throw err;
    })

}

const sendPass = (invitedGuest, date) => {
    const passId = invitedGuest.invitedGuestId.toString();
    var fullDate = moment(date, 'YYYY-MM-DD').format("dddd, MMMM D, YYYY");
    var transporter = nodemailer.createTransport({
        service: 'gmail.com',
        auth: {
            user: 'matt.d.urbeck@gmail.com',
            pass: 'bwqv frxy suhh uxwf'
        }
    });

    var mailOptions = {
        from: 'matt.d.urbeck@gmail.com',
        to: 'matt.d.urbeck@gmail.com',
        subject: `Pinnacle Day Pass: ${fullDate}`,
        attachments: [{
            filename: `${passId}.png`,
            path: `./qr_code_images/${passId}.png`,
            cid: 'qr_code' //same cid value as in the html img src
        }],
        html: `<p>Hello ${invitedGuest.invitedGuestName},</p><p>${invitedGuest.residentFirstName} ${invitedGuest.residentLastName} invited you to Pinnacle Lake on ${fullDate}. Scan the QR Code at the gate to enter.</p><img src="cid:qr_code"/><p>(This code can only be scanned once. After scanning, it will be disabled and you can't reenter the property using this code)</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // Send an email to me about details of failed message so I can do it manually
            sendFailedEmailsToMe(invitedGuest, date);
            console.log(error);
        } else {
            // Send the email and update the passSent field for resident and passes collection
            updatePassSentField(invitedGuest, date)
            console.log('Email sent: ' + info.response);
        }
    });
}


// Send details of failed emails to me
const sendFailedEmailsToMe = (guestInfo, date) => {
    var passId = guestInfo.invitedGuestId.toString();
    var fullDate = moment(date, 'YYYY-MM-DD').format("dddd, MMMM D, YYYY");
    var transporter = nodemailer.createTransport({
        service: 'gmail.com',
        auth: {
            user: 'matt.d.urbeck@gmail.com',
            pass: 'bwqv frxy suhh uxwf'
        }
    });

    var mailOptions = {
        from: 'matt.d.urbeck@gmail.com',
        to: 'matt.d.urbeck@gmail.com',
        subject: `PASS FAILED TO SEND`,
        attachments: [{
            filename: `${passId}.png`,
            path: `./qr_code_images/${passId}.png`,
            cid: 'qr_code' //same cid value as in the html img src
        }],
        html: `<p>Resident Name: ${guestInfo.residentId.toString()} : ${guestInfo.residentFirstName} ${guestInfo.residentLastName}</p><p>Guest Name: ${guestName}</p><p>Date: ${fullDate}</p><p>Pass ID: ${passId}</p><p>./qr_code_images/${passId}.png</p><img src="cid:qr_code"/>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // If the email also fails, recursively try until it works.
            sendFailedEmailsToMe(guestInfo, date)
            console.log(error);
        } else {
            // Update the db to change passSent to True
            console.log('successfully sent email sent with failed information: ' + info.response);
        }
    });
}



const updatePassSentField = (guestInfo, date) => {
    // Update in the Passes collection
    Passes.updateOne(
        { passDate: date },
        { $set: { 'invitedGuestPass.$[guestId].invitedGuestPassSent': true } },
        { arrayFilters: [{ 'guestId.invitedGuestId': guestInfo.invitedGuestId }] }
    )
        .then((result) => {
            console.log("successfully set passSent to true for ", guestInfo.invitedGuestName, ' in Passes collection...');
            console.log(result);
        })
        .catch((error) => {
            console.log("failed to set passSent to true for ", guestInfo.invitedGuestName, ' in Passes collection...');
        })

}



// Send the passes
const findPassesToSend = (date) => {
    // Takes the date of the passes we want to find ('YYYY-MM-DD')
    Passes.findOne(
        { passDate: date }
    )
        .then((result) => {
            // If result is not null, loop though each guest
            if (result != null) {
                console.log('successfully found passes from Passes collection...');
                var invitedGuestArray = result.invitedGuestPass
                invitedGuestArray.forEach((guest, index) => {
                    if (!guest.invitedGuestPassSent) {
                        // Loop though each guest and send the email
                        createQRCode(guest);
                        console.log('successfully created qr code for ', guest.invitedGuestName, 'sent by ', guest.residentFirstName, guest.residentLastName);
                        sendPass(guest, date)
                        console.log("successfully sent email to ", guest.invitedGuestName);
                    }
                })
            } else {
                console.log('The result was null. No guests were invited this day: ', date);
            }
        })
        .catch((error) => {
            console.log('failed to find passes from Passes collection...', error);
        })
}














// Scheduler to run function that deletes old passes
const deleteOldPassesWorker = schedule.scheduleJob('00 23 * * *', () => {
    console.log('Delete old passes task executed at 11 AM:', new Date().toLocaleTimeString());
    deleteOldPasses()
});

// Scheduler to run function that sends todays passes every 15 minutes
const sendTodayPassesWorker = schedule.scheduleJob('*/15 * * * *', () => {
    console.log('Found passes task executed at 11 AM:', new Date().toLocaleTimeString());
    var now = moment().format('YYYY-MM-DD');
    findPassesToSend(now);
});


// Scheduler to run function that sends tomorrows passes as noon
const sendTomorrowsPassesWorkerMorning = schedule.scheduleJob('00 12 * * *', () => {
    console.log('Task executed at 12:00PM:', new Date().toLocaleTimeString());
    var tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    findPassesToSend(tomorrow);
});

// Scheduler to run function that sends tomorrows passes as 6PM
const sendTomorrowsPassesWorkerEvening = schedule.scheduleJob('00 18 * * *', () => {
    console.log('Task executed at 12:00PM:', new Date().toLocaleTimeString());
    var tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    findPassesToSend(tomorrow);
});

// Scheduler to run function that sends tomorrows passes before midnight
const sendTomorrowsPassesWorkerNight = schedule.scheduleJob('55 59 23 * * *', () => {
    console.log('Task executed at 11:59PM:', new Date().toLocaleTimeString());
    var tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    findPassesToSend(tomorrow);
});


module.exports = app;
