const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
		},

		userEmails: [
			{
				type: Schema.Types.ObjectId,
				ref: "Email",
			},
		],
	},
	//decide later what to do with this
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
