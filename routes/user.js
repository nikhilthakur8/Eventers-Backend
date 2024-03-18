const express = require("express");
const {
    handleUserSignUp,
    handleUserLogin,
    handleProfileUpdate,
    getUser,
    googleLogin,
    SendMailForForgotPassword,
    resetPassword,
} = require("../controllers/user");
const upload = require("../middleware/multer");
const userRouter = express.Router();
const { authorizeUser } = require("../middleware/authorizeUser");
const Token = require("../models/token");
const sendMail = require("../utils/sendMail");
const User = require("../models/user");

userRouter.route("/signup").post(handleUserSignUp);
userRouter.route("/login").post(handleUserLogin);
userRouter.route("/logout").get((req, res) => {
    res.clearCookie("uid");
    return res.status(200).json("Logout Successfully");
});
userRouter
    .route("/profile")
    .get(authorizeUser, getUser)
    .post(authorizeUser, upload.single("profileImg"), handleProfileUpdate);

userRouter.route("/:id/verify/:token").get(async (req, res) => {
    const { id, token } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json("User not found");
        if (user.verified) return res.status(400).json("User already verified");
        const newToken = await Token.findOne({
            token: token,
            userId: id,
        });
        if (!newToken) return res.status(404).json("Invalid Link");
        await User.findByIdAndUpdate(id, { verified: true });
        await Token.findByIdAndDelete(newToken.id);
        return res.status(200).json("User Verified Successfully");
    } catch (error) {
        return res.status(500).json("Internal Server Error");
    }
});

userRouter.post("/forgot-password", SendMailForForgotPassword);
userRouter.post("/:id/reset-password/:token", resetPassword);

userRouter.get("/oauth/session/google", googleLogin);

module.exports = userRouter;
