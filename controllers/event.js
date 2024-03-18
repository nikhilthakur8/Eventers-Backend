const uploadFile = require("../utils/cloudinary");
const fs = require("fs");
const Event = require("../models/event");
const User = require("../models/user");
const { log } = require("console");
const { createTokenForUser } = require("../Service/Auth");

const createEvent = async (req, res) => {
    const eventDetails = req?.body;
    const eventLogoPath = req?.file?.path;
    try {
        if (eventLogoPath) {
            const eventLogoURL = await uploadFile(eventLogoPath);
            fs.unlink(eventLogoPath, () => {});
            eventDetails.eventLogo = eventLogoURL.url;
        }
        try {
            const isEventAvailable = await Event.findOne({
                eventNumber: eventDetails.eventNumber,
            });
            if (!isEventAvailable) {
                eventDetails.madeBy = req.user.id;
                const newEvent = await Event.create(eventDetails);
                return res.json(newEvent);
            } else {
                if (req.user.id === isEventAvailable.madeBy.toString()) {
                    const updatedEventData = await Event.findOneAndUpdate(
                        { eventNumber: eventDetails.eventNumber },
                        eventDetails.event,
                        {
                            new: true,
                        }
                    );
                    return res.json(updatedEventData);
                } else {
                    return res.status(401).json("Unauthorized");
                }
            }
        } catch (error) {
            if (error.code == 11000)
                return res.status(409).json("Event Already exists");
            else return res.status(500).json(error.message);
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

async function createEventStep2(req, res) {
    const eventDetails = req?.body;
    const { eventNumber } = eventDetails;
    try {
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventDetails,
            { new: true }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

async function getEventDetails(req, res) {
    const { eventNumber } = req.params;
    try {
        const eventDetails = await Event.findOne({ eventNumber });
        if (eventDetails) return res.json(eventDetails);
        else return res.status(404).json("No Event Found");
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

function eventDefaultContent(req, res) {
    const query = req.query.type;
    const eventContent = {
        "Webinars & Workshops": `<p>This field allows you to provide detailed information about the webinar or workshop event you are listing. Include essential details such as topics, speakers, date and time, and any other pertinent information. The more comprehensive your description, the better!</p>

        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Specify the main topics or themes that the webinar or workshop will cover.</li>
          <li>Provide details about the speakers or facilitators, including their credentials and expertise.</li>
          <li>Indicate the date and time of the event, including any time zone considerations.</li>
          <li>Mention whether the event is free or if there is a registration fee.</li>
          <li>Include any prerequisites or materials participants should have.</li>
        </ul>
        
        <p><strong>Webinar/Workshop Format:</strong></p>
        <ul>
          <li>Describe the format of the webinar or workshop (e.g., presentation, hands-on activities, Q&A).</li>
          <li>Specify the platform or tools participants will need to access the event.</li>
          <li>Provide information on how participants can join or register for the event.</li>
          <li>Include any interactive elements or opportunities for participant engagement.</li>
        </ul>
        
        <p><strong>Additional Information:</strong></p>
        <ul>
          <li>Mention any post-event resources or materials that will be provided to participants.</li>
          <li>Include contact information for inquiries or assistance related to the webinar or workshop.</li>
        </ul>
        `,
        "Hackathon & Coding Challenges": `<p>This field allows you to provide detailed information about the hackathon or coding challenges event you are listing. Include essential details such as rules, eligibility criteria, coding languages allowed, and any other pertinent information. The more comprehensive your description, the better!</p>

        <p><strong>Guidelines:</strong></p>
        <ul>
          <li>Specify eligibility criteria for participants (e.g., students, professionals, or specific skill levels).</li>
          <li>Clarify the coding languages allowed for the challenges.</li>
          <li>Mention any specific tools or platforms participants should be familiar with.</li>
          <li>Provide information on the duration of the hackathon or coding challenges.</li>
          <li>Include any pre-requisites or preparation steps participants need to take.</li>
        </ul>
        
        <p><strong>Rules:</strong></p>
        <ul>
          <li>List the rules participants must adhere to during the hackathon or coding challenges.</li>
          <li>Specify any constraints or limitations on the solutions participants can propose.</li>
          <li>Clarify the judging criteria, if applicable.</li>
          <li>Include details on how participants can register or sign up for the event.</li>
        </ul>
        `,
        "Cultural Event": `<p>This field allows you to provide detailed information about the cultural event you are listing. Ensure to include essential details such as rules, eligibility criteria, performance formats, and any other pertinent information. The more comprehensive your description, the better!</p>

        <p><strong>Guidelines:</strong></p>
        <ul>
          <li>Specify eligibility criteria for participants.</li>
          <li>Describe the various performance formats available (e.g., dance, music, drama).</li>
          <li>Indicate whether solo or group performances are allowed.</li>
          <li>Mention any specific themes or topics for performances, if applicable.</li>
          <li>Provide information on the duration of each performance.</li>
        </ul>
        
        <p><strong>Rules:</strong></p>
        <ul>
          <li>List the rules participants must adhere to during their cultural performances.</li>
          <li>Specify any costume or prop requirements.</li>
          <li>Clarify the judging criteria, if applicable.</li>
          <li>Include details on how participants can register or sign up for the cultural event.</li>
        </ul>
        `,
        Quizzes: `<p>This field allows you to provide detailed information about the quiz event you are listing. Ensure to include essential details such as rules, eligibility criteria, quiz format, and any other pertinent information. The more comprehensive your description, the better!</p>

        <p><strong>Guidelines:</strong></p>
        <ul>
          <li>Specify eligibility criteria for participants.</li>
          <li>Describe the quiz format (e.g., multiple-choice questions, written round, etc.).</li>
          <li>Indicate if it is a solo or team quiz.</li>
          <li>Provide information on the number of rounds and their respective themes, if applicable.</li>
          <li>Mention any specific requirements for participants, such as devices or materials needed.</li>
        </ul>
        
        <p><strong>Rules:</strong></p>
        <ul>
          <li>List the rules participants must adhere to during the quiz.</li>
          <li>Specify any penalties for rule violations.</li>
          <li>Clarify the scoring system if it differs from standard scoring.</li>
          <li>Include details on tie-breaking procedures if necessary.</li>
        </ul>
        `,
        "Competitions & Challenges": `<p>This field helps you to mention the details of the opportunity you are listing. It is better to include Rules, Eligibility, Process, Format, etc., in order to get the opportunity approved. The more details, the better!</p>
        <p><strong>Guidelines:</strong></p>
        <ul>
        <li>Mention all the guidelines like eligibility, format, etc.</li>
        <li>Inter-college team members allowed or not.</li>
        <li>Inter-specialization team members allowed or not.</li>
        <li>The number of questions/ problem statements.</li>
        <li>Duration of the rounds.</li>
        </ul>
        <p><strong>Rules:</strong></p>
        <ul>
        <li>Mention the rules of the competition.</li>
        </ul>`,
        Fest: `<p>This field helps you to mention the details of the annual fest event you are listing. It is better to include information such as rules, eligibility criteria, event process, and any specific formats required. Providing comprehensive details will enhance the chances of your event getting approved. The more information you provide, the better!</p>

        <p><strong>Guidelines:</strong></p>
        <ul>
          <li>Specify eligibility criteria for participants.</li>
          <li>Clarify whether inter-college team members are allowed or not.</li>
          <li>Indicate if inter-specialization team members are allowed or not.</li>
          <li>Mention the number of questions/problem statements participants can expect.</li>
          <li>Provide information on the duration of each round.</li>
        </ul>
        
        <p><strong>Rules:</strong></p>
        <ul>
          <li>List the rules of the annual fest event.</li>
        </ul>
        `,
        Scholarships: `<p>This field helps you to mention the details of the scholarship you are listing. It is better to include Eligibility, Process, Format, etc., in order to get the opportunity approved. The more details, the better!</p>
        <p><strong>Guidelines:</strong></p>
        <ul>
        <li>Mention all the guidelines like eligibility, format, etc.</li>
        </ul>
        <p><strong>Application Procedure:</strong></p>
        <ul>
        <li>Mention the procedure that participants have to follow.</li>
        </ul>
        <p><strong>Rewards:</strong></p>
        <ul>
        <li>Mention the details of the rewards that will be awarded to the selected registrants.</li>
        </ul>`,
    };
    res.json(eventContent[query]);
}

async function updateAboutEvent(req, res) {
    const eventData = req.body;
    console.log(eventData);
    const eventNumber = eventData.eventNumber;
    try {
        if (req?.file) {
            const eventLogoPath = req.file.path;
            const eventLogoURL = await uploadFile(eventLogoPath);
            fs.unlink(eventLogoPath, () => {});
            eventData.eventLogo = eventLogoURL.url;
        }
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventData,
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function createEventBanner(req, res) {
    const eventData = req.body;
    const eventNumber = eventData.eventNumber;
    try {
        if (req?.file) {
            const eventBannerPath = req?.file.path;
            const eventBannerURL = await uploadFile(eventBannerPath);
            fs.unlink(eventBannerPath, () => {});
            const updatedEventData = await Event.findOneAndUpdate(
                { eventNumber },
                { eventBanner: eventBannerURL.url },
                {
                    new: true,
                }
            );
            return res.json(updatedEventData);
        } else return res.status(500).json("Invalid Data");
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function updateBasicDetails(req, res) {
    const eventData = req.body;
    const eventNumber = eventData.eventNumber;
    const eventLogoPath = req?.file?.path;
    try {
        if (eventLogoPath) {
            const eventLogoURL = await uploadFile(eventLogoPath);
            fs.unlink(eventLogoPath, () => {});
            eventData.eventLogo = eventLogoURL.url;
        }
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventData,
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function createImportantDate(req, res) {
    const eventData = req.body;
    const eventNumber = eventData.eventNumber;
    const eventBrochurePath = req?.file?.path;
    log(eventData);
    try {
        if (eventBrochurePath) {
            const eventBrochureURL = await uploadFile(eventBrochurePath);
            fs.unlink(eventBrochurePath, () => {});
            eventData.eventBrochure = eventBrochureURL.url;
        }
        console.log(eventData);
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventData,
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function createRounds(req, res) {
    const eventData = req.body;
    const eventNumber = eventData?.eventNumber;
    try {
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventData,
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function createPrizes(req, res) {
    const eventData = req.body;
    const eventNumber = eventData?.eventNumber;
    try {
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            eventData,
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}
async function activateEvent(req, res) {
    const eventNumber = req?.params.eventNumber;
    try {
        const updatedEventData = await Event.findOneAndUpdate(
            { eventNumber },
            { status: true },
            {
                new: true,
            }
        );
        return res.json(updatedEventData);
    } catch (error) {
        return res.status(500).json(error.message);
    }
}

function getAllEvents(req, res) {
    Event.find({ status: true })
        .then((events) => {
            res.json(events.reverse());
        })
        .catch((err) => {
            res.status(500).json(err.message);
        });
}

function findEvent(req, res) {
    const query = req.query;
    query.status = true;
    Event.find(query)
        .then((event) => {
            res.json(event.reverse());
        })
        .catch((err) => {
            res.status(500).json(err.message);
        });
}

const myEvent = async (req, res) => {
    try {
        const eventDetails = await Event.find({ madeBy: req.user.id });
        const filteredArray = eventDetails.filter((e) => e !== null).reverse();
        res.json(filteredArray);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

module.exports = {
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
    getAllEvents,
    findEvent,
    myEvent,
};
