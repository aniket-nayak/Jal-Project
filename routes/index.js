var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    middleware = require('../middleware/index');




router.get("/", (req, res) => {
    res.render("home");
});

router.get("/pay", middleware.isLoggedIn, (req, res) => {
    res.render("pay");
});

module.exports = router;