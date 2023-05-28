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

		//FLASH SUCCESS MESSAGE
		//REDIRECT TO LOGIN PAGE
		// res.redirect("/sign-in");
		//can just send a regular back end response for now
		res.json({
			message: "success",
			payload: createdUser,
		});
	} catch (e) {
		//need to do some sort of error handling or validation in the form
		//HANDLE ERRORS AND FORM VALIDATION FROM FRONTEND
		//STAY ON SIGN UP PAGE
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
			throw new Error("User not found please sign up");
		} else {
			let comparedPassword = await bcrypt.compare(
				req.body.password,
				user.password
			);

			if (!comparedPassword) {
				throw new Error("Please check your email and password");
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
		let email = await Email.findOne({ _id: req.params.emailId });
		res.json({
			payload: { toAddress: email.toAddress, subject: email.emailSubject },
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
// async function updateUserInfo(req, res, next) {}

//UPDATE USER PASSWORD

//DELETE USER AND ALL EMAILS
// async function deleteUserInfo(req, res, next) {}

module.exports = {
	createUser,
	signIn,
	getAllUserEmails,
	getOneEmail,
	getUserInfo,
};
