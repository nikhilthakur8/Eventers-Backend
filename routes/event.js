const express = require("express");
const eventRouter = express.Router();
const upload = require("../middleware/multer");
const { authorizeUserForEvent } = require("../middleware/authorizeUser");
const {
    createEvent,
    eventDefaultContent,
    createEventStep2,
    getEventDetails,
    updateBasicDetails,
    updateAboutEvent,
    createEventBanner,
    createImportantDate,
    createRounds,
    createPrizes,
    activateEvent,
} = require("../controllers/event");

// Step 1 Create Event
eventRouter
    .route("/create/:eventNumber/step1")
    .post(upload.single("eventLogo"), createEvent);
// Step 2 Create Event
eventRouter
    .route("/create/:eventNumber/step2")
    .post(authorizeUserForEvent, createEventStep2);

// Step 3 Create Event

eventRouter
    .route("/create/:eventNumber/step3/basicdetails")
    .post(
        authorizeUserForEvent,
        upload.single("eventLogo"),
        updateBasicDetails
    );
eventRouter
    .route("/create/:eventNumber/step3/eventBanner")
    .post(
        authorizeUserForEvent,
        upload.single("eventBanner"),
        createEventBanner
    );
eventRouter
    .route("/create/:eventNumber/step3/importantDate")
    .post(
        authorizeUserForEvent,
        upload.single("eventBrochure"),
        createImportantDate
    );
eventRouter
    .route("/create/:eventNumber/step3/aboutEvent")
    .post(authorizeUserForEvent, updateAboutEvent);
eventRouter
    .route("/create/:eventNumber/step3/rounds")
    .post(authorizeUserForEvent, createRounds);
eventRouter
    .route("/create/:eventNumber/step3/prizes")
    .post(authorizeUserForEvent, createPrizes);

// Step 3 Activate Event
eventRouter
    .route("/create/:eventNumber/step3/activateEvent")
    .get(authorizeUserForEvent, activateEvent);

// Static Route
eventRouter.route("/details/:eventNumber").get(getEventDetails);
eventRouter.route("/content").get(eventDefaultContent);
module.exports = eventRouter;
