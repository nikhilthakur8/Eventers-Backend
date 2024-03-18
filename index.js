// Importing Files
const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();

// Importing Custom Modules
const userRouter = require("./routes/user");
const eventRouter = require("./routes/event");
const connectToMongoDB = require("./service");
const authenticatingUser = require("./middleware/auth");
const staticRouter = require("./routes/staticRouter");
// MongoDB
connectToMongoDB(process.env.MONGODB_URI);

// App Initialization
const app = express();

// Use cookie-parser middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// Middleware
app.use(authenticatingUser);
// Use built-in Express middleware for parsing JSON and urlencoded data
app.use(express.json());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/", staticRouter);

// Server Connection
app.listen(process.env.PORT, () => {
    console.log(`App Successfully Started At Port ${process.env.PORT}`);
});
