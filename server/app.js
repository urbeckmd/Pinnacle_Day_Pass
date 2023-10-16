const bcrypt = require("bcrypt");
const dbConnect = require("./db/dbConnect");
const Resident = require("./db/residentModel");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');


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


app.get("/getInvitedGuests", (request, response) => {
    const currentUser = request.query.email;
    console.log(currentUser);
    Resident.findOne({residentEmail: currentUser})
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

app.put("/addGuest", (request, response) => {
    console.log(request.body);
})


module.exports = app;