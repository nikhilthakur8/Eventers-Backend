const jwt = require("jsonwebtoken");

function createTokenForUser(user) {
    const userDetails = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user?.gender,
        course: user?.course,
        collegeName: user?.collegeName,
    };
    try {
        const secretKey = process.env.SECRET_KEY;
        return jwt.sign(userDetails, secretKey);
    } catch (error) {
        return null;
    }
}
function verifyToken(token) {
    try {
        const secretKey = process.env.SECRET_KEY;
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
}
module.exports = {
    createTokenForUser,
    verifyToken,
};
