const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../Service/Auth");
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        gender: {
            type: String,
        },
        course: {
            type: String,
        },
        collegeName: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        profileImg: [
            {
                type: String,
            },
        ],
        location: {
            type: String,
        },
        courseSpecialisation: {
            type: String,
        },
        salt: {
            type: String,
            unique: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return;
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");
    this.password = hashedPassword;
    this.salt = salt;
    next();
});

userSchema.statics.matchPassword = async function ({ email, password }) {
    try {
        const user = await User.findOne({ email });
        if (user) {
            const hashedPassword = createHmac("sha256", user.salt)
                .update(password)
                .digest("hex");
            if (hashedPassword === user.password) {
                const token = createTokenForUser(user);
                return { token, user };
            } else {
                const unauthorizedError = new Error("Invalid Password");
                unauthorizedError.statusCode = 401;
                throw unauthorizedError;
            }
        } else {
            const notFoundError = new Error("Invalid Email Address");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }
    } catch (error) {
        error.statusCode = error.statusCode || 500;
        throw error;
    }
};
const User = new mongoose.model("user", userSchema);
module.exports = User;
