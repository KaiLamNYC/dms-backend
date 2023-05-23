const express = require("express");
const router = express.Router();

const {
	createUser,
	signIn,
	getUserEmails,
	updateUserInfo,
} = require("../../controllers/api/userController");
const verifyJWT = require("../../controllers/middleware/verifyJWT");

router.post("/create-user", createUser);

router.post("/sign-in", signIn);

router.get("/get-user-emails", verifyJWT, getUserEmails);

router.put("/update-user-info", verifyJWT, updateUserInfo);

module.exports = router;
