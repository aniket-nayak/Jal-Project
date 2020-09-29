var express = require('express'),
    router = express.Router(),
    paypal = require('paypal-rest-sdk'),
    User = require('../models/user'),
    middleware = require('../middleware/index');




router.get("/", (req, res) => {
    res.render("home");
});

router.get("/water", (req, res) => {
    res.render("water");
});

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/pay", middleware.isLoggedIn, (req, res) => {
    res.render("pay");
});


module.exports = router;