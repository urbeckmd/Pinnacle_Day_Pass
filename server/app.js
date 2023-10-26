const bcrypt = require("bcrypt");
const dbConnect = require("./db/dbConnect");
const Resident = require("./db/residentModel");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const schedule = require("node-schedule");
const mongoose = require("mongoose");
var QRCode = require('qrcode');
var nodemailer = require('nodemailer');


dbConnect()

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
                    if (!passwordCheck) {
                        return response.status(400).send({
                            message: "Passwords do not match 1",
                            error
                        })
                    }
                    const token = jwt.sign(
                        {
                            residentId: resident._id,
                            residentEmail: resident.email,
                        },
                        "1pn8XwAhk2iapj6ThxzyFHZdZ5eTpuMh",
                        { expiresIn: "12h" }
                    );
                    response.status(200).send({
                        message: "Login Successful",
                        email: resident.residentEmail,
                        token,
                    });
                })
                .catch((error) => {
                    response.status(400).send({
                        message: "Passwords do not match 2",
                        error,
                    });
                })
        })
        .catch((e) => {
            response.status(404).send({
                message: "Email not found",
                e
            });
        });
});


// Retrieve all the invited guests
app.get("/getInvitedGuests", (request, response) => {
    const currentUser = request.query.email;
    console.log(currentUser);
    Resident.findOne({ residentEmail: currentUser })
        .then((result) => {
            const invitedGuests = result.invitedGuests;
            response.status(200).send({
                data: invitedGuests
            })
        })
        .catch((e) => {
            response.status(400).send({
                message: "Email not found in database...",
                e,
            });
        });
})

// Retrieve all the saved guests
app.get("/getSavedGuests", (request, response) => {
    const currentUser = request.query.email;
    console.log(currentUser);
    Resident.findOne({ residentEmail: currentUser })
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


const sendTodaysInvite = (request, guestId) => {
    const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date(new Date(request.body.guestDateOfVisit).toISOString())
    console.log('today', today);
    Resident.find(
        { "residentEmail": request.body.residentName, "invitedGuests.date": new Date(today), "invitedGuests.invitedGuestsForDate.invitedGuestPassSent": false },
    )
        .then((result2) => {
            const residentResult = result2[0]
            console.log('residentresult', residentResult);
            const residentFirstName = residentResult['residentFirstName'];
            const residentLastName = residentResult['residentLastName'];
            const residentId = residentResult['_id'].toString();
            residentResult["invitedGuests"].forEach((allGuests, dateIndex) => {
                if (allGuests['date'].toISOString() == today.toISOString()) {
                    console.log('dateindex', dateIndex);
                    const dateOfVisit = allGuests['date'];
                    const day = ((dateOfVisit.getDay() + 1) < 7) ? (dateOfVisit.getDay() + 1) : 0;
                    const month = dateOfVisit.getMonth();
                    const date = dateOfVisit.getDate() + 1;
                    const year = dateOfVisit.getFullYear();
                    const fullDate = `${daysList[day]}, ${monthsList[month]} ${date}, ${year}`
                    console.log(fullDate);
                    allGuests['invitedGuestsForDate'].forEach((invitedGuest, guestIndex) => {
                        if (invitedGuest['invitedGuestId'].toString() == guestId.toString()) {
                            console.log(invitedGuest, guestIndex);
                            // SEND MESSAGE WITH PASS
                            const guestName = invitedGuest['invitedGuestName'];
                            const guestNumber = invitedGuest['invitedGuestNumber'];
                            const passId = guestId.toString();
                            makeQRCodeAndSendEmail(passId, guestName, residentFirstName, residentLastName, fullDate, residentId, dateIndex, guestIndex);

                        }
                    })
                }
            })
        })
        .catch((error) => {
            console.log(error);
        })
}


// Add guest to array of invites guests
app.put("/addGuest", (request, response) => {
    const guestId = new mongoose.Types.ObjectId();
    const date = new Date(request.body.guestDateOfVisit);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dbDateString = `${month}/${day}/${year}`
    // if people are already invited on this date, push new guest
    // else push new date with new guest
    if (request.body.dateExists) {
        Resident.findOneAndUpdate(
            { residentEmail: request.body.residentName },
            {
                $push: {
                    "invitedGuests.$[elem].invitedGuestsForDate": {
                        "invitedGuestId": guestId,
                        "invitedGuestName": request.body.guestName,
                        "invitedGuestNumber": request.body.guestNumber,
                        "invitedGuestPassScanned": false,
                        "invitedGuestPassSent": false
                    }
                }
            },
            { arrayFilters: [{ "elem.date": new Date(new Date(request.body.guestDateOfVisit).toISOString()) }] },
        )
            .then((result) => {
                // If they add the guest for today, send invite immediately
                if (dbDateString == new Date().toLocaleDateString()) {
                    sendTodaysInvite(request, guestId)
                }
                response.status(200).send({
                    message: "Guest was added...",
                    result,
                });

            })
            .catch((error) => {
                response.status(400).send({
                    message: "Guest was not added...",
                    error,
                });

            })
    }
    else {
        Resident.findOneAndUpdate(
            { residentEmail: request.body.residentName },
            {
                $push: {
                    "invitedGuests": {
                        'date': new Date(new Date(request.body.guestDateOfVisit).toISOString()),
                        'invitedGuestsForDate': [{
                            "invitedGuestId": guestId,
                            "invitedGuestName": request.body.guestName,
                            "invitedGuestNumber": request.body.guestNumber,
                            "invitedGuestPassScanned": false,
                            "invitedGuestPassSent": false
                        }]
                    }
                }
            },
        )
            .then((result) => {
                // If they add the guest for today, send invite immediately
                if (dbDateString == new Date().toLocaleDateString()) {
                    sendTodaysInvite(request, guestId)
                }
                response.status(200).send({
                    message: "Guest was added to new date...",
                    result,
                });
            })
            .catch((error) => {
                response.status(400).send({
                    message: "Guest was not added...",
                    error,
                });
            })
    }
})


// Add guest to array of saved guests
app.post("/saveGuest", (request, response) => {
    console.log(request.body);
    Resident.updateOne(
        { residentEmail: request.body.residentName },
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
                message: "successfully saved",
                result
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: "not saved",
                error
            })
        })
})



// Delete the old passes each morning
const deleteOldPasses = () => {
    Resident.updateMany(
        {},
        { $pull: { "invitedGuests": { date: { $lt: new Date(new Date(new Date().setHours(19, 0, 0, 0) - 86400000).toISOString()) } } } }
    )
        .then((result) => {
            const x = new Date(new Date().toISOString());
            console.log(result);
        })
        .catch((error) => {
            console.log(error);
        })
}

// Scheduler to run function that deletes old passes
const deleteOldPassesWorker = schedule.scheduleJob('0 11 * * *', () => {
    console.log('Task executed at 11 AM:', new Date().toLocaleTimeString());
    deleteOldPasses()
});


// Send details of failed emails to me
const sendFailedEmailsToMe = (fullDate, passId, qr_code_path, guestName, residentFirstName, residentLastName) => {
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
            path: qr_code_path,
            cid: 'qr_code' //same cid value as in the html img src
        }],
        html: `<p>Resident Name: ${residentFirstName} ${residentLastName}</p><p>Guest Name: ${guestName}</p><p>Date: ${fullDate}</p><p>Pass ID: ${passId}</p><p>${qr_code_path}</p><img src="cid:qr_code"/>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // Send an email to me about details of failed message so I can do it manually
            console.log(error);
        } else {
            // Update the db to change passSent to True
            console.log('Email sent: ' + info.response);
        }
    });
}

// // Update the pass sent field after email is sent
// const updateTodayPassSentField = (residentId, guestId, today) => {
//     Resident.findOne(
//         {"_id": new mongoose.Types.ObjectId(residentId)}
//     )
//     .then((result) => {
//         const invitedGuestResult = result.invitedGuests
//         invitedGuestResult.forEach((date, date_index) => {
//             if (date['date'].toISOString() == new Date(today).toISOString()) {
//                 date['invitedGuestsForDate'].forEach((guest, guestIndex) => {
//                     console.log(guest);
//                     if (guest['invitedGuestId'].toString() == guestId) {
//                         console.log(`GUESTINDEX: ${guestIndex}`);
//                         var query = `invitedGuests.${date_index}.invitedGuestsForDate.${guestIndex}.invitedGuestPassSent`
//                         console.log(query);
//                         var updateObj = {$set : {}};
//                         updateObj.$set[query] = true;
//                         Resident.updateOne(
//                             {"_id": new mongoose.Types.ObjectId(residentId)},
//                             updateObj
//                         )
//                         .then((result2) => {
//                             console.log(result2);
//                         })
//                         .catch((error2) => {
//                             console.log(error2);
//                         })
//                     }
//                 })
//             }
//         })
//     })
//     .catch((error) => {
//         console.log(error);
//     })
// }




const updatePassSentField = (residentId, date_index, guest_index) => {
    var query = `invitedGuests.${date_index}.invitedGuestsForDate.${guest_index}.invitedGuestPassSent`
    console.log(query);
    var updateObj = { $set: {} };
    updateObj.$set[query] = true;
    Resident.updateOne(
        { "_id": new mongoose.Types.ObjectId(residentId) },
        updateObj
    )
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.log(error);
        })
}

// Make QR Code and send Email for guests coming tomorrow
const makeQRCodeAndSendEmail = (passId, guestName, residentFirstName, residentLastName, fullDate, residentId, dateIndex, guestIndex) => {
    QRCode.toFile(`./qr_code_images/${passId}.png`, passId, function (err) {
        if (err) throw err
        var qr_code_path = `./qr_code_images/${passId}.png`
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
                path: qr_code_path,
                cid: 'qr_code' //same cid value as in the html img src
            }],
            html: `<p>Hello ${guestName},</p><p>${residentFirstName} ${residentLastName} invited you to Pinnacle Lake on ${fullDate}. Scan the QR Code at the gate to enter.</p><img src="cid:qr_code"/><p>(This code can only be scanned once. After scanning, it will be disabled and you can't reenter the property using this code)</p>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                // Send an email to me about details of failed message so I can do it manually
                sendFailedEmailsToMe(fullDate, passId, qr_code_path, guestName, residentFirstName, residentLastName);
                console.log(error);
            } else {
                // Update the db to change passSent to True
                try {
                    console.log(dateIndex, guestIndex);
                    updatePassSentField(residentId.toString(), dateIndex, guestIndex)
                } catch (e) {
                    console.log(`unable to update sent passes field for ${guestName} from ${residentFirstName} ${residentLastName}`);
                }

                console.log('Email sent: ' + info.response);
            }
        });
    })
}

// updatePassSentField('6530689631f30a3de8962879', 0, 0)

// Send passes to all of tomorrows guests
const findAllTomorrowsPasses = () => {
    const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const tomorrow = new Date(new Date().setHours(19, 0, 0, 0)).toISOString();
    console.log(tomorrow);
    Resident.find(
        { "invitedGuests.date": new Date(tomorrow), "invitedGuests.invitedGuestsForDate.invitedGuestPassSent": false },
    )
        .then((result) => {
            result.forEach((dates) => {
                const residentFirstName = dates['residentFirstName'];
                const residentLastName = dates['residentLastName'];
                const residentId = dates['_id'];
                dates["invitedGuests"].forEach((allGuests, dateIndex) => {
                    if (allGuests['date'].toISOString() == tomorrow) {
                        console.log(dateIndex);
                        const dateOfVisit = allGuests['date'];
                        const day = ((dateOfVisit.getDay() + 1) < 7) ? (dateOfVisit.getDay() + 1) : 0;
                        const month = dateOfVisit.getMonth();
                        const date = dateOfVisit.getDate() + 1;
                        const year = dateOfVisit.getFullYear();
                        const fullDate = `${daysList[day]}, ${monthsList[month]} ${date}, ${year}`

                        if (!allGuests['invitedGuestPassSent']) {
                            allGuests['invitedGuestsForDate'].forEach((invitedGuest, guestIndex) => {
                                // SEND MESSAGE WITH PASS
                                const guestName = invitedGuest['invitedGuestName'];
                                const guestNumber = invitedGuest['invitedGuestNumber'];
                                guestId = invitedGuest['invitedGuestId'];
                                const passId = invitedGuest['invitedGuestId'].toString();
                                console.log(guestIndex);
                                makeQRCodeAndSendEmail(passId, guestName, residentFirstName, residentLastName, fullDate, residentId, dateIndex, guestIndex);
                            })
                        }
                    }
                })
            })
        })
        .catch((error) => {
            console.log(error);
        })
}


// Scheduler to run function that sends tomorrows passes as noon
const sendTomorrowsPassesWorkerMorning = schedule.scheduleJob('0 12 * * *', () => {
    console.log('Task executed at 12:00PM:', new Date().toLocaleTimeString());
    findAllTomorrowsPasses();
});

// Scheduler to run function that sends tomorrows passes before midnight
const sendTomorrowsPassesWorkerNight = schedule.scheduleJob('55 59 23 * * *', () => {
    console.log('Task executed at 11:59PM:', new Date().toLocaleTimeString());
    findAllTomorrowsPasses();
});

// findAllTomorrowsPasses();


module.exports = app;
