const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",  // or use SMTP if you prefer
    auth: {
        user: process.env.EMAIL_USER,  // Your email
        pass: process.env.EMAIL_PASS   // Your app password
    }
});

module.exports = transporter;
