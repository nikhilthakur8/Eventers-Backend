const User = require("../models/user");
const { createTokenForUser, verifyToken } = require("../Service/Auth");
const fs = require("fs");
const uploadFile = require("../utils/cloudinary");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");
function makeid(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

function santizeUserData({ _doc }) {
    delete _doc.salt;
    delete _doc.password;
    delete _doc.createdAt;
    delete _doc.updatedAt;
    delete _doc.__v;
    return _doc;
}

const handleUserSignUp = async (req, res) => {
    const data = req.body; // Extracting the data from body
    req.body.email = data.email.toLowerCase();
    try {
        const newUser = await User.create(data);
        const token = await Token.create({
            token: crypto.randomBytes(32).toString("hex"),
            userId: newUser._id,
        });
        const url = `${process.env.BASE_URL}/${newUser._id}/verify/${token.token}`;
        const html = `<body style="font-family: Arial, sans-serif;">
         <div style="max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f8f8f8;">
             <h2>Email Verification</h2>
             <p>Dear ${newUser.firstName + " " + newUser?.lastName},</p>
             <p>Thank you for signing up! Please click the link below to verify your email address:</p>
             <a href=${url} style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
     
             <p>If you did not sign up for our service, you can ignore this email.</p>
     
             <p>Best regards,<br>Eventers</p>
         </div>
     
     </body>`;
        await sendEmail(req.body.email, "Verify Account", html);
        res.json("Please check your Mail Inbox to verify");
    } catch (error) {
        if (error.code == 11000) {
            return res.status(409).json("Email Address Already in use"); // Error 11000 for Duplicate Key
        } else {
            return res.status(500).json("Internal Server Error"); // Generic Error
        }
    }
};

const handleUserLogin = async (req, res) => {
    const data = req.body;
    try {
        // creating token
        const { token, user } = await User.matchPassword(data);
        const userData = santizeUserData(user);
        if (!user.verified) {
            const token = await Token.findOne({ userId: user._id });
            if (!token) {
                const token = await Token.create({
                    token: crypto.randomBytes(32).toString("hex"),
                    userId: user._id,
                });
                const url = `${process.env.BASE_URL}/${user._id}/verify/${token.token}`;
                const html = `<body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f8f8f8;">
                    <h2>Email Verification</h2>
                    <p>Dear ${user.firstName + " " + user?.lastName},</p>
                    <p>Thank you for signing up! Please click the link below to verify your email address:</p>
                    <a href=${url} style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            
                    <p>If you did not sign up for our service, you can ignore this email.</p>
            
                    <p>Best regards,<br>Eventers</p>
                </div>
            
            </body>`;
                await sendEmail(req.body.email, "Verify Account", html);
            }
            return res
                .status(400)
                .json("An Email sent to your account please verify");
        }
        res.cookie("uid", token);
        return res.json(userData);
    } catch (error) {
        // Hanlding the error
        return res.status(500).json(error.message);
    }
};

const handleProfileUpdate = async (req, res) => {
    const userData = req.body;
    const profileImgPath = req?.file?.path;
    const reqUser = req.user;
    try {
        if (profileImgPath) {
            const profileImgURL = await uploadFile(profileImgPath);
            if (profileImgURL) {
                fs.unlink(profileImgPath, () => {});
                userData.profileImg = profileImgURL.url;
            }
        }
        try {
            const userDetails = await User.findByIdAndUpdate(
                reqUser?.id,
                userData,
                { new: true }
            );
            return res.json(santizeUserData(userDetails));
        } catch (error) {
            return res.status(500).json(error.message);
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

async function getUser(req, res) {
    try {
        const currentUser = await User.findById(req.user.id);
        if (currentUser) {
            const userData = santizeUserData(currentUser);
            return res.json(userData);
        } else {
            return res.status(404).json("User not found");
        }
    } catch (error) {
        return res.status(404).json(error.message);
    }
}

async function googleLogin(req, res) {
    const { code, error } = req.query;
    if (error) return res.status(400).json(error);
    if (!code) return res.status(400).json("No Token provided");
    try {
        const value = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        };
        const { data } = await axios.post(
            "https://oauth2.googleapis.com/token",
            value
        );
        const decoded = jwt.decode(data.id_token);
        if (decoded) {
            const user = await User.findOne({ email: decoded.email });
            if (user) {
                const token = createTokenForUser(user);
                return res.cookie("uid", token).json(santizeUserData(user));
            } else {
                const newUser = await User.create({
                    email: decoded.email.toLowerCase(),
                    firstName: decoded.given_name,
                    lastName: decoded?.family_name,
                    profileImg: [decoded.picture],
                    password: makeid(30),
                    verified: true,
                });
                const token = createTokenForUser(newUser);
                return res.cookie("uid", token).json(santizeUserData(newUser));
            }
        } else {
            return res.status(400).json("Invalid Token");
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

const SendMailForForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userDetails = await User.findOne({ email });
        if (!userDetails) return res.status(404).json("Invalid Email Address");
        else {
            const token = await Token.create({
                userId: userDetails._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
            const url = `${process.env.BASE_URL}/${userDetails._id}/reset-password/${token.token}`;
            const html = `<body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f8f8f8;">
                <h2>Password Reset</h2>
                <p>Dear ${
                    userDetails.firstName + " " + userDetails?.lastName
                },</p>
                <p>We received a request to reset your password. Please click the link below to reset your password:</p>
                <a href=${url} style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        
                <p>If you did not request a password reset, you can ignore this email.</p>
        
                <p>Best regards,<br>Eventers</p>
            </div>
        
        </body>
        `;
            await sendEmail(email, "Reset Password", html);
            return res.json("Please check your Mail Inbox to reset password");
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    try {
        const deletedToken = await Token.findOneAndDelete({
            token,
            userId: id,
        });
        if (deletedToken) {
            const salt = crypto.randomBytes(16).toString();
            await User.findByIdAndUpdate(id, {
                password: crypto
                    .createHmac("sha256", salt)
                    .update(password)
                    .digest("hex"),
                salt,
            });
            return res.json("Password reset successfully");
        } else {
            return res.status(404).json("Invalid Link");
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

module.exports = {
    handleUserSignUp,
    handleUserLogin,
    handleProfileUpdate,
    getUser,
    googleLogin,
    SendMailForForgotPassword,
    resetPassword,
};
