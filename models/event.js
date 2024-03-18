const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
    {
        eventType: {
            //Give Options to User
            type: String,
            required: true,
        },
        eventNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        eventName: {
            type: String,
            required: true,
        },
        festivalName: {
            //Optional
            type: String,
        },
        organisationName: {
            type: String,
            required: true,
        },
        eventWebsite: {
            // Optional
            type: String,
        },
        modeOfEvent: {
            // 0 - Online 1 - Offline
            type: String,
            required: true,
        },
        locationName: {
            type: String,
        },
        countryName: {
            type: String,
        },
        stateName: {
            type: String,
        },
        cityName: {
            type: String,
        },
        aboutEvent: {
            // About  Event
            type: String,
            required: true,
        },
        contactDetails: [
            {
                name: String,
                number: String,
            },
        ],
        importantDates: [
            {
                date: String,
                dateTitle: String,
            },
        ],
        rounds: [
            {
                title: String,
                description: String,
                isEliminatorRound: String,
                startDate: String,
                endDate: String,
            },
        ],
        prizes: [
            {
                cashAmount: Number,
                rank: Number,
            },
        ],
        participationType: {
            type: String,
        },
        eventBrochure: {
            type: String,
        },
        eventBrochureTitle: {
            type: String,
        },
        eventLogo: {
            type: String,
        },
        eventBanner: {
            type: String,
        },
        participationType: {
            type: String,
        },
        minTeam: {
            type: Number,
        },
        maxTeam: {
            type: Number,
        },
        startDate: {
            type: String,
        },
        endDate: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false,
        },
        madeBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Event = new mongoose.model("event", eventSchema);
module.exports = Event;
