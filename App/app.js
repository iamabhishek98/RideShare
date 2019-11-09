if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const bcrypt = require('bcrypt')
const passport = require('passport')

const flash = require('express-flash');
const session = require('express-session');

// //Authentication Setup
// require('./auth').load();

/* --- V7: Using dotenv     --- */
require('dotenv').config();

var indexRouter = require("./routes/index");
/**
 * Added pages
 */
var signupRouter = require("./routes/signup");
var loginRouter = require("./routes/login");
var messageRouter = require("./routes/message");
var passengerRouter = require("./routes/passenger");
var driverRouter = require("./routes/driver");
var panalyticsRouter = require("./routes/panalytics");
var danalyticsRouter = require("./routes/danalytics");
var discountRouter = require("./routes/discount");
var tripRouter = require("./routes/trip");
var becomeDriverRouter = require("./routes/becomeDriver");
var inboxRouter = require("./routes/inbox");
var songRouter = require("./routes/songs");
var feedbackRouter = require("./routes/feedback");
var locationsRouter = require("./routes/locations");
var driverHistoryRouter = require("./routes/driverHistory");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/", indexRouter);

/* --- V6: Modify Database  --- */
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/login", loginRouter);
/* ---------------------------- */

app.use("/signup", signupRouter);
app.use("/message", messageRouter);
app.use("/passenger", passengerRouter);
app.use("/driver", driverRouter);
app.use("/panalytics", panalyticsRouter);
app.use("/danalytics", danalyticsRouter);
app.use("/discount", discountRouter);
app.use('/trip', tripRouter);
app.use('/becomeDriver', becomeDriverRouter);
app.use('/inbox', inboxRouter);
app.use('/songs', songRouter);
app.use('/feedback', feedbackRouter);
app.use('/locations', locationsRouter);
app.use('/driverHistory', driverHistoryRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
