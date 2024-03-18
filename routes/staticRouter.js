const express = require("express");
const { getAllEvents, findEvent, myEvent } = require("../controllers/event");

const staticRouter = express.Router();

staticRouter.route("/event/get-all").get(getAllEvents);
staticRouter.route("/event/find").get(findEvent);
staticRouter.route("/my/event").get(myEvent);

module.exports = staticRouter;
