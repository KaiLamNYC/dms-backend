const Email = require("../../models/emailModel");
const User = require("../../models/userModel");
const axios = require("axios");
require("dotenv").config();

//SENDGRID STUFF
const sgMail = require("@sendgrid/mail");

//stuff for unique id
const crypto = require("crypto");
const CRON_API = process.env.CRONJOB_API_KEY;

//THIS STARTS THE CHAIN OF EVENTS
/*
CREATES EMAIL DOCUMENT
SAVES IT TO THE DATABASE WITH USER
CREATES A CRONJOB FOR THE FIRST INTERVAL
REMOVES FIRST INTERVAL
CRONJOB POINTS TO SEND CHECKIN BACKEND ROUTE
SAVES THE CRONJOB ID TO EMAIL DOCUMENT
*/
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

/*
CRONJOB HITS THIS ROUTE FOR CHECKINS AFTER CREATING EMAIL
CREATES A UNIQUE CHECKIN PASSWORD
SAVES IT TO THE EMAIL DOCUMENT FOR CHECKING LATER
SENDS EMAIL WITH CHECKIN URL THAT CONTAINS UNIQUE PASSWORD
CHECKIN URL IS A BACKEND ROUTE
CREATES A CRONJOB THAT SENDS THE PAYLOAD AT 24H IF NO CHECKIN
UPDATE THE EMAIL DOCUMENT WITH THE CORRECT CRONJOB ID FOR DEELTEION LATER

*/
async function sendCheckinEmail(req, res) {
	try {
		//need to do some error handling if no email found
		const email = await Email.findById(req.body.emailID);

		//create cronjob 24 hours from now for payload using the emailid and emailid.interval

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

/* 
VERY IMPORTANT
HANDLES THE CHECK AND KEEPTS THE SWITCH RUNNING
NEEDS TO CHECK FOR CORRECT CHECKIN PASSWORD
IF NO PASSWORD SHOW ERROR SCREEN TO USER AND DONT CONFIRM CHECK IN
IF PASSWORD IS CORRECT, DELETE 24 HOUR PAYLOAD USING CRONJOB ID FROM EMAIL DOCUMENT
THEN CHECK THE EMAIL DOCUMENT FOR ANY INTERVALS LEFT
CREATES A CRONJOB OR THE SEND CHECK IN BACKEND ROUTE USING THE REMAINING INTERVAL IF ANY
IF NO INTERVAL THEN DELETE THE EMAIL DOCUMENT
OR DO SOMETHING ELSE
*/
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
/*
ROUTE FOR USER TO DELETE THE EMAIL USING A PASSWORD THAT WAS SET AT THE CREATING OF THE EMAIL DOCUMENT
TAKES IN THE USERS INPUT
CHECKS IT AGAINST THE EMAIL CURRENTLY VIEWING
IF MATCH THEN DELETE EMAIL DOCUMENT AND THE CORRESPONDING CRONJOB
*/
async function deleteEmail(req, res, next) {
	try {
		let emailID = req.params.emailID;
		let user = await User.findById({ _id: req.userId });

		let email = await Email.findById({ _id: emailID });

		if (email.password === req.body.emailPassword) {
			await Email.deleteOne({ _id: emailID });

			let foundEmailInUser = user.userEmails.indexOf(emailID);
			user.userEmails.splice(foundEmailInUser, 1);
			await user.save();

			//NEED TO HANDLE DELETING CRONJOB
			res.json({
				payload: "success",
			});
		} else {
			res.json({
				message: "error",
				payload: "Incorrect Password!",
			});
		}
	} catch (e) {
		res.json({
			message: "failed to delete email",
			payload: `failure ${e}`,
		});
	}
}

//NEED A PAYLOAD FUNCTION TO ACTUALLY SEND THE EMAIL
//MAYBE REFACTOR TO SEPARATE THE CREATING CRONJOB AND ID THING IDK

//probably need a function to create the cronjob using an email id and the interval

//TESTING FUNCTION TO CREEATE STARTER DATA FOR EMAIL
async function makeEmail(req, res, next) {
	try {
		const email = new Email({
			toAddress: req.body.email,
			emailBody: req.body.message,
			emailSubject: req.body.subject,
			password: req.body.password,
			intervals: req.body.intervals,
		});

		await email.save();

		let user = await User.findById({ _id: req.userId });

		//need some error handling to check for dupes or something
		user.userEmails.push(email._id);

		await user.save();

		res.json({
			message: "successfully created email",
			payload: user,
		});
	} catch (e) {
		res.json({
			message: "failed to create email",
			payload: `failure ${e}`,
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

module.exports = {
	createEmail,
	sendCheckinEmail,
	testFunction,
	confirmCheckin,
	makeEmail,
	deleteEmail,
};
