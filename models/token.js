const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 600,
    },
});
const Token = mongoose.model("token", tokenSchema);

module.exports = Token;
