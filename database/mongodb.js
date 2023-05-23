const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", true);

function connectToMongoDB() {
	let MONGO_DB = process.env.MONGODB_URI;
	mongoose
		.connect(MONGO_DB)
		.then(() => console.log("connected to mongo"))
		.catch((err) => console.log(`error connecting to mongo ${err}`));
}

module.exports = connectToMongoDB;
