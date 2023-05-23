const Email = require("../../models/emailModel");
const axios = require("axios");
require("dotenv").config();

//SENDGRID STUFF
const sgMail = require("@sendgrid/mail");

//stuff for unique id
const crypto = require("crypto");
const CRON_API = process.env.CRONJOB_API_KEY;

//function to create an email
async function createEmail(req, res, next) {
	try {
		//first need to save the email
		const { toAddress, emailBody, password, intervals } = req.body;
		const newEmail = new Email({
			toAddress,
			emailBody,
			password,
			intervals,
		});

		//need to hash the password and store it later but for now okay cuz testing

		await newEmail.save();

		//need to parse the intervals for the cron schedule

		//cronjob stuff
		// const CRON_API = process.env.CRONJOB_API_KEY;

		const config = {
			headers: {
				"Content-Type": "application/json",
				//NEED TO REPLACE WITH PROCESS.ENV FOR CRONJOB KEY
				Authorization: `Bearer ${CRON_API}`,
			},
		};
		//TESTING SENDING THRU BODY CAN SEND THRU URL PARAM
		const emailInfo = {
			emailID: newEmail._id,
		};
		//fake url for now but will be hitting the backend route for the send checkin email
		//localhost3000:/api/send-checkin-email/${emailID}
		const data = {
			job: {
				url: "https://www.send-check-in-email.com",
				title: "send email checkin",
				enabled: "true",
				requestMethod: 1,
				saveResponses: true,

				schedule: {
					timezone: "America/New_York",
					months: [12],
					mdays: [25],
					wdays: [1],
					hours: [12],
					minutes: [30],
				},
				extendedData: {
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(emailInfo),
				},
			},
		};

		await axios
			.put("https://api.cron-job.org/jobs", data, config)
			.then((response) => {
				console.log(`statusCode: ${response.status}`);
				console.log(response.data);
				//grabbing the cronjob id from response and saving it to email doc
				newEmail.cronjobID = response.data.jobId;
				newEmail.save();
			})
			.catch((error) => {
				console.error(error);
			});

		res.json({
			message: "successfully created job",
			payload: newEmail,
		});
	} catch (err) {
		res.json({
			message: "failed",
			payload: `failed create email task ${err}`,
		});
	}
}

async function sendCheckinEmail(req, res) {
	try {
		//need to do some error handling if no email found
		const email = await Email.findById(req.body.emailID);

		//create cronjob 24 hours from now using the emailid and emailid.interval

		const config = {
			headers: {
				"Content-Type": "application/json",
				//NEED TO REPLACE WITH PROCESS.ENV FOR CRONJOB KEY
				Authorization: `Bearer ${CRON_API}`,
			},
		};
		//TESTING SENDING THRU BODY CAN SEND THRU URL PARAM
		const emailInfo = {
			emailID: email._id,
		};
		//fake url for now but will be hitting the backend route for the send checkin email
		//localhost3000:/api/send-checkin-email/${emailID}
		const data = {
			job: {
				url: "https://www.sendpayload.com",
				title: "send payload",
				enabled: "true",
				requestMethod: 1,
				saveResponses: true,

				schedule: {
					timezone: "America/New_York",
					months: [12],
					mdays: [25],
					wdays: [1],
					hours: [12],
					minutes: [30],
				},
				extendedData: {
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(emailInfo),
				},
			},
		};

		await axios
			.put("https://api.cron-job.org/jobs", data, config)
			.then((response) => {
				console.log(`statusCode: ${response.status}`);
				console.log(response.data);
				//grabbing the cronjob id from response and saving it to email doc
				email.cronjobID = response.data.jobId;
				// email.save();
			})
			.catch((error) => {
				console.error(error);
			});
		//save the response and update the cronjob id
		let uniqueID = crypto.randomBytes(15);
		uniqueID = uniqueID.toString("hex");
		email.checkinID = uniqueID;
		email.save();

		const checkInLink = `localhost:3000/api/checkin/${uniqueID}/${email._id}`;

		//save id to the email document
		//send email with the link

		// using Twilio SendGrid's v3 Node.js Library

		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		const msg = {
			to: "kailam633@gmail.com", // Change to your recipient
			from: "kailamnyc@gmail.com", // Change to your verified sender
			subject: "DMS CHECK IN",
			text: "and easy to do anywhere, even with Node.js",
			html: `<strong>click this link to check in <a>${checkInLink}</a></strong>`,
		};
		await sgMail
			.send(msg)
			.then(() => {
				console.log("Email sent");
			})
			.catch((error) => {
				console.error(error);
			});

		res.json({
			message: "sucessfully createded job",
			payload: email,
		});
	} catch (err) {
		res.json({
			message: "failed sending email",
			payload: `email error ${err}`,
		});
	}
}

async function testFunction(req, res) {
	try {
		const ranString = crypto.randomBytes(10);
		res.json({
			message: "success",
			payload: ranString.toString("hex"),
		});
	} catch (err) {
		res.json({
			message: "failure",
			payload: `test function failed ${err}`,
		});
	}
}

async function confirmCheckin(req, res, next) {
	try {
		const emailID = req.params.emailID;
		const uniqueID = req.params.uniqueID;
		//if id matches
		const email = await Email.findById(emailID);

		if (email.checkinID === uniqueID) {
			//need to delete the cronjob
			const cronjobID = email.cronjobID;
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${CRON_API}`,
				},
			};
			await axios
				.delete(`https://api.cron-job.org/jobs/${cronjobID}`, config)
				.then((response) => {
					// console.log(`statusCode: ${response.status}`);
					console.log(response);
					//grabbing the cronjob id from response and saving it to email doc
					// email.save();
				})
				.catch((error) => {
					console.error(error);
				});

			//parse and delete the interval
			let intervalArr = email.intervals.split(",");
			intervalArr.splice(0, 1);

			//if more intervals left
			if (intervalArr.length > 0) {
				email.intervals = intervalArr.toString();
				await email.save();
				//need to hit the original route to create a cronjob with the interval and the email id
				//CRONJOB FUNCTION FROM FIRST ROUTE
				res.json({
					message: "still more intervals left",
					payload: email,
				});
			} else {
				//job is done no more intervals
				await Email.findByIdAndRemove(email._id);
				res.json({
					message: "successfully deleted email",
				});
			}
		} else {
			//redirect to an error page
			res.json({
				message: "failed to match id",
			});
		}
	} catch (err) {
		res.json({
			message: "failed to delete cronjob",
			payload: err,
		});
	}
}

//probably need a function to create the cronjob using an email id and the interval

//and another function for the payload email for 24 hours

module.exports = {
	createEmail,
	sendCheckinEmail,
	testFunction,
	confirmCheckin,
};
