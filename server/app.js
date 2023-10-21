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


// Add guest to array of invites guests
app.put("/addGuest", (request, response) => {
    // if people are already invited on this date, push new guest
    // else push new date with new guest
    console.log(request.body);
    if (request.body.dateExists) {
        Resident.updateOne(
            { residentEmail: request.body.residentName },
            {
                $push: {
                    "invitedGuests.$[elem].invitedGuestsForDate": {
                        "invitedGuestId": new mongoose.Types.ObjectId(),
                        "invitedGuestName": request.body.guestName,
                        "invitedGuestNumber": request.body.guestNumber,
                        "invitedGuestPassScanned": false,
                        "invitedGuestPassSent": false
                    }
                }
            },
            { arrayFilters: [{ "elem.date": new Date(new Date(request.body.guestDateOfVisit).toISOString()) }] },
            { upsert: true }
        )
            .then((result) => {
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
    } else {
        Resident.updateOne(
            { residentEmail: request.body.residentName },
            {
                $push: {
                    "invitedGuests": {
                        'date': new Date(new Date(request.body.guestDateOfVisit).toISOString()),
                        'invitedGuestsForDate': [{
                            "invitedGuestId": new mongoose.Types.ObjectId(),
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
const scheduledTask = schedule.scheduleJob('0 1 * * *', () => {
    console.log('Task executed at 12:10PM:', new Date().toLocaleTimeString());
    deleteOldPasses()
});







const findAllTomorrowsPasses = () => {
    const monthsList = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const tomorrow = new Date(new Date().setHours(19, 0, 0, 0)).toISOString()
    Resident.find(
        { "invitedGuests.date": new Date(tomorrow), "invitedGuests.invitedGuestsForDate.invitedGuestPassSent": false },
    )
        .then((result) => {
            result.forEach((dates) => {
                const residentFirstName = dates['residentFirstName'];
                const residentLastName = dates['residentLastName'];
                dates["invitedGuests"].forEach((allGuests) => {
                    if (allGuests['date'].toISOString() == tomorrow) {
                        const dateOfVisit = allGuests['date'];
                        const day = dateOfVisit.getDay()+1;
                        const month = dateOfVisit.getMonth();
                        const date = dateOfVisit.getDate()+1;
                        const year = dateOfVisit.getFullYear();
                        const fullDate = `${daysList[day]}, ${monthsList[month]} ${date}, ${year}`
                        console.log(fullDate);

                        if (!allGuests['invitedGuestPassSent']) {
                            allGuests['invitedGuestsForDate'].forEach((invitedGuest) => {
                                // SEND MESSAGE WITH PASS
                                console.log(invitedGuest);
                                const guestName = invitedGuest['invitedGuestName'];
                                const guestNumber = invitedGuest['invitedGuestNumber'];
                                const passId = invitedGuest['invitedGuestId'].toString();
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
                                        html: `<p>Hello ${guestName},</p><p>${residentFirstName} ${residentLastName} invited you to Pinnacle Lake on ${fullDate}. Scan the QR Code at the gate to enter.</p><img src="cid:qr_code"/>`
                                    };

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                })
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

findAllTomorrowsPasses();


module.exports = app;
