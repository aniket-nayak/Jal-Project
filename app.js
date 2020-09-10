var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyparser = require("body-parser"),
    flash = require("connect-flash"),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    expressSession = require("express-session"),
    passportlocalmongoose = require("passport-local-mongoose");

require('dotenv').config();


var authRoutes = require('./routes/auth'),
    indexRoutes = require('./routes/index');

var url = process.env.DATABASEKEY || "mongodb://localhost/jalproject";

mongoose
    .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => {
        console.log("CONNECTED TO DB");
    })
    .catch((err) => {
        console.log(err);
    });

app.use(
    bodyparser.urlencoded({
        extended: true
    })
);
app.use(flash());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//Passport Configuration
app.use(
    expressSession({
        secret: "Hello World",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});



app.use(authRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server Started..");
});