const { verifyToken } = require("../Service/Auth");

function authenticatingUser(req, res, next) {
    const token = req.cookies?.uid;
    if (token) {
        const userDetails = verifyToken(token);
        req.user = userDetails;
    }
	next();
}


module.exports = authenticatingUser;