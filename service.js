const mongoose = require("mongoose");
async function connectToMongoDB(url){
	await mongoose.connect(url);
	console.log("Successfully connected to MongoDB");
}
module.exports = connectToMongoDB;