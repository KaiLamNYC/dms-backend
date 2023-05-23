const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const emailSchema = new mongoose.Schema({
	toAddress: {
		type: String,
		required: true,
	},
	emailBody: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	intervals: {
		type: String,
		required: true,
	},
	cronjobID: {
		type: String,
	},
	checkinID: {
		type: String,
	},
	// cronJobs: [
	// 	{
	// 		type: Schema.Types.ObjectId,
	// 		ref: "CronJob",
	// 	},
	// ],
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
