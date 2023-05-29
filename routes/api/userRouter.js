const express = require("express");
const router = express.Router();

const {
	createUser,
	signIn,
	getAllUserEmails,
	getOneEmail,
	getUserInfo,
	updateUserInfo,
	updateUserPassword,
} = require("../../controllers/api/userController");
const verifyJWT = require("../../controllers/middleware/verifyJWT");

router.post("/create-user", createUser);

router.post("/sign-in", signIn);

router.get("/get-emails", verifyJWT, getAllUserEmails);

router.get("/get-one-email/:emailId", getOneEmail);

router.get("/get-user", verifyJWT, getUserInfo);

router.put("/update-user-info", verifyJWT, updateUserInfo);

router.put("/update-user-password", verifyJWT, updateUserPassword);
module.exports = router;
