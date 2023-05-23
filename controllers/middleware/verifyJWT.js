const jwt = require("jsonwebtoken");
require("dotenv").config();

async function verifyJWT(req, res, next) {
	const token = req.headers["x-access-token"];

	if (!token) {
		res.json({
			message: "token is missing",
		});
	} else {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
			if (err) {
				res.json({
					auth: false,
					message: `authentication failed ${err}`,
				});
			} else {
				req.userId = decoded.id;
				next();
			}
		});
	}
}

module.exports = verifyJWT;
