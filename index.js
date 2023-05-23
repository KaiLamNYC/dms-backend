const express = require("express");
const app = express();

const path = require("path");
const logger = require("morgan");
const PORT = 3001;
const cors = require("cors");
// const oneDay = 1000 * 60 * 60 * 24;

// const mongoose = require("mongoose");
// const MongoStore = require("connect-mongo");

//function to connect to mongo database
const connectToMongoDB = require("./database/mongodb");
require("dotenv").config();

const cookieParser = require("cookie-parser");

// const sessions = require("express-session");

// app.set("view engine", "ejs");

// app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ("GET", "POST", "PUT", "DELETE"),
		credentials: true,
	})
);

app.use(cookieParser());

app.use(logger("dev"));

app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(
// 	sessions({
// 		secret: process.env.COOKIE_SECRET,
// 		resave: true,
// 		saveUninitialized: false,
// 		store: MongoStore.create({
// 			mongoUrl: process.env.MONGODB_URI,
// 			mongooseCOnnection: mongoose.connection,
// 			autoReconnect: true,
// 		}),
// 		cookie: { maxAge: oneDay },
// 	})
// );

// app.use(function (req, res, next) {
// 	res.locals.currentUser = req.session.userId;
// 	next();
// });

//api router stuff
const userRouter = require("./routes/api/userRouter");
app.use("/api/users", userRouter);

const emailRouter = require("./routes/api/emailRouter");
app.use("/api/emails", emailRouter);

app.listen(PORT, () => {
	console.log(`beep boop server on ${PORT}`);

	//database connection
	connectToMongoDB();
});

//testing stuff
