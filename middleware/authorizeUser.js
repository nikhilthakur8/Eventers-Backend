const Event = require("../models/event");
function authorizeUser(req, res, next) {
    if (!req?.user) return res.status(401).json("Unauthorized");
    next();
}

async function authorizeUserForEvent(req, res, next) {
    const { eventNumber } = req?.params;
    if (!eventNumber) return res.status(500).json("Event Number is required");
    try {
        const event = await Event.findOne({ eventNumber });
        if (event) {
            if (req.user.id === event.madeBy.toString()) {
                next();
            } else {
                return res.status(401).json("Unauthorized");
            }
        } else {
            return res.status(404).json("Event not found");
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

module.exports = {
    authorizeUser,
    authorizeUserForEvent,
};
