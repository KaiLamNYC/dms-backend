const express = require("express");
const router = express.Router();

const {
	createEmail,
	sendCheckinEmail,
	testFunction,
	confirmCheckin,
	makeEmail,
} = require("../../controllers/api/emailController");

const verifyJWT = require("../../controllers/middleware/verifyJWT");

router.post("/create-email", createEmail);

router.post("/send-checkin-email", sendCheckinEmail);

router.post("/test-function", testFunction);

router.post("/confirm-checkin/:uniqueID/:emailID", confirmCheckin);

//TEST ROUTE TO CREATE EMAIL ONLY
router.post("/make-email", verifyJWT, makeEmail);

module.exports = router;
