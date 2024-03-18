const nodemailer = require("nodemailer");
module.exports = async (email, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const mailOptions = {
            from: `"Eventers" <${process.env.EMAIL}>`,
            to: email,
            subject: subject,
            html,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error.message);
    }
};
