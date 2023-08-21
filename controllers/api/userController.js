const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Email = require("../../models/emailModel");

//can make function to get all users later not rlly neccessary

async function createUser(req, res, next) {
	try {
		//destructuring the sign up form
		const { email, name, password } = req.body;

		//bcrypt stuff
		let salt = await bcrypt.genSalt(10);
		let hashedPasssword = await bcrypt.hash(password, salt);

		//creating the new user document
		const createdUser = new User({
			email,
			name,
			password: hashedPasssword,
		});

		await createdUser.save();

		//since i saved the user document first then returned it in the reponse, it provides me the users id
		//so can use this with the email to pass the email id after creation

		//can do this another way
		// const newUserObj = {
		// 	username,
		// 	email,
		// 	firstName,
		// 	lastName,
		// 	password: hashedPasssword,
		// }

		// await User.create(newUserObj)

		
		res.json({
			message: "success",
			payload: createdUser,
		});
	} catch (e) {
	
		res.json({
			message: "failure",
			payload: `failed to create user ${e}`,
		});
	}
}

//SIGN IN FUNCTION WITH JWT
async function signIn(req, res) {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			///DO SOMETHING NEED TO REDIRECT WITH ERRORS
			// throw new Error("User not found please sign up");
			res.json({
				message: "error",
				payload: "User not found!",
			});
		} else {
			let comparedPassword = await bcrypt.compare(
				req.body.password,
				user.password
			);

			if (!comparedPassword) {
				// throw new Error("Please check your email and password");
				res.json({
					message: "error",
					payload: "Incorrect Password!",
				});
			} else {
				//ALL INFO IS CORRECT CONTINUE TO LOGIN

				//NEEDED TO ACCESS ANY OF THE DASHBAORD PAGES
				// req.session.isAuth = true;

				//USER OBJECT FOR THE SREVER SIDE SESSION

				// let userObj = {
				// 	name: user.name,
				// 	email: user.email,
				// };

				// req.session.user = userObj;

				// res.json({
				// 	message: "success",
				// 	parload: userObj,
				// });

				const token = jwt.sign(
					{ id: user._id },
					process.env.ACCESS_TOKEN_SECRET,
					{
						expiresIn: "1d",
					}
				);

				res.json({
					auth: true,
					token: token,
					name: user.name,
					email: user.email,
				});
			}
		}
	} catch (e) {
		res.json({
			message: "failure",
			payload: `error logging in: ${e}`,
		});
	}
}

//DISPLAYING EMAIL INFORMATION FOR THE DASHBOARD
async function getAllUserEmails(req, res, next) {
	try {
		let user = await User.findById({ _id: req.userId });
		// let user = await User.findById({ _id: req.body.userId });

		let userEmails = [];

		for (let i = 0; i < user.userEmails.length; i++) {
			let oneEmail = await Email.findOne({ _id: user.userEmails[i] });
			userEmails.push({
				toAddress: oneEmail.toAddress,
				subject: oneEmail.emailSubject,
				id: oneEmail._id,
			});
		}

		res.json({ payload: userEmails });
	} catch (e) {
		res.json({
			message: "failed to fetch user emails",
			payload: `failed to get emails ${e}`,
		});
	}
}

//DISPLAYING ONE EMAIL
async function getOneEmail(req, res, next) {
	try {
		//NEED SOME ERROR HANDLING TO CHECK IF THE USER.EMAILS CONTAINS THE ID FIRST
		let email = await Email.findOne({ _id: req.params.emailId });
		res.json({
			payload: {
				toAddress: email.toAddress,
				subject: email.emailSubject,
				intervals: email.intervals,
			},
		});
	} catch (e) {
		res.json({
			message: "error getting one email",
			payload: `error fetching one email ${e}`,
		});
	}
}

//GET USER INFORMATION FOR ACCOUNT PAGE
async function getUserInfo(req, res, next) {
	try {
		let user = await User.findById({ _id: req.userId });
		let firstName = user.name.split(" ")[0];
		let lastName = user.name.split(" ")[1];
		let currentUser = {
			email: user.email,
			firstName,
			lastName,
		};
		res.json({
			payload: currentUser,
		});
	} catch (e) {
		res.json({
			message: "error getting user information",
			payload: `error getting user ${e}`,
		});
	}
}

//UPDATE USER INFORMATION
async function updateUserInfo(req, res, next) {
	try {
		let user = await User.findByIdAndUpdate(req.userId, req.body, {
			new: true,
		});

		res.json({
			messsage: "success",
			payload: user,
		});
	} catch (e) {
		res.json({
			message: "failed to udpdate user",
			payload: `failed to update user ${e}`,
		});
	}
}

//UPDATE USER PASSWORD
async function updateUserPassword(req, res, next) {
	try {
		let user = await User.findById({ _id: req.userId });

		let comparedPassword = await bcrypt.compare(
			req.body.oldPassword,
			user.password
		);

		if (!comparedPassword) {
			res.json({
				message: "failed to update user password",
				payload: "old password does not match",
			});
		} else if (req.body.newPassword != req.body.confirmPassword) {
			res.json({
				message: "failed to update user password",
				payload: "new passwords do not match",
			});
		} else {
			//ALL PASSWORDS MATCH, THEREFORE UPDATE PASSWORD
			let salt = await bcrypt.genSalt(10);
			let hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

			user.password = hashedPassword;
			user.save();

			res.json({
				message: "successfully updated user password",
				payload: user,
			});
		}
	} catch (e) {
		res.json({
			message: "failed to udpdate user",
			payload: `failed to update user ${e}`,
		});
	}
}

//DELETE USER AND ALL EMAILS AND ALL CRONJOBS
// async function deleteUserInfo(req, res, next) {}

module.exports = {
	createUser,
	signIn,
	getAllUserEmails,
	getOneEmail,
	getUserInfo,
	updateUserInfo,
	updateUserPassword,
};
