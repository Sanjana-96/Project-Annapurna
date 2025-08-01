const transporter = require("../config/email");
const emailTemplate = require("./emailTemplate");

async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: `"Project Annapurna" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: emailTemplate(subject,message)
        });
        console.log("Email sent to:", to);
    } catch (err) {
        console.error("Email sending error:", err);
    }
}

module.exports = sendEmail;
