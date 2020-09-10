var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user'),
    middleware = require('../middleware/index'),
    async = require('async'),
        nodemailer = require('nodemailer'),
        crypto = require("crypto");

require('dotenv').config();

//Register form
router.get("/register", (req, res) => {
    res.render("register");
});
router.post("/register", (req, res) => {
    var newUser = new User({
        name: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.mobile,
        address: req.body.address
    });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            console.log("success");
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Welcome to JAL " + user.username);
                res.redirect("/pay");
            });
        }
    });
});
//Login Form
router.get("/login", (req, res) => {
    res.render("login");
});
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }),
    (req, res) => {}
);

//logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged you out!!");
    res.redirect("/");
});

// forgot password
router.get("/forgot", function (req, res) {
    res.render("forgot");
});

router.post("/forgot", function (req, res, next) {
    async.waterfall(
        [
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString("hex");
                    done(err, token);
                });
            },
            function (token, done) {
                User.findOne({
                        email: req.body.email
                    },
                    function (err, user) {
                        if (!user) {
                            req.flash("error", "No account with that email address has been registered.");
                            return res.redirect("/forgot");
                        }

                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        user.save(function (err) {
                            done(err, token, user);
                        });
                    }
                );
            },
            function (token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: "aniketproject99@gmail.com",
                        pass: "seetulshaan"
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: "aniketproject99@gmail.com",
                    subject: "The JAL Password Reset",
                    text: "You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n" +
                        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                        "http://" +
                        req.headers.host +
                        "/reset/" +
                        token +
                        "\n\n" +
                        "If you did not request this, please ignore this email and your password will remain unchanged.\n"
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log("mail sent");
                    req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
                    done(err, "done");
                });
            }
        ],
        function (err) {
            if (err) return next(err);
            res.redirect("/forgot");
        }
    );
});

router.get("/reset/:token", function (req, res) {
    User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        },
        function (err, user) {
            if (!user) {
                req.flash("error", "Password reset token is invalid or has expired");
                return res.redirect("/forgot");
            }
            res.render("reset", {
                token: req.params.token
            });
        }
    );
});

router.post("/reset/:token", function (req, res) {
    async.waterfall(
        [
            function (done) {
                User.findOne({
                        resetPasswordToken: req.params.token,
                        resetPasswordExpires: {
                            $gt: Date.now()
                        }
                    },
                    function (err, user) {
                        if (!user) {
                            req.flash("error", "Password reset token is invalid or has expired");
                            console.log(err);
                            return res.redirect("back");
                        }
                        if (req.body.password === req.body.confirm) {
                            user.setPassword(req.body.password, function (err) {
                                user.resetPasswordToken = undefined;
                                user.resetPasswordExpires = undefined;

                                user.save(function (err) {
                                    req.logIn(user, function (err) {
                                        done(err, user);
                                    });
                                });
                            });
                        } else {
                            req.flash("error", "Passwords do not match");
                            console.log(err);
                            return res.redirect("back");
                        }
                    }
                );
            },
            function (user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: "aniketproject99@gmail.com",
                        pass: process.env.GMAILPW
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: "aniketproject99@gmail.com",
                    subject: "Your password has been changed",
                    text: "Hello,\n\n" +
                        "This is a confirmation that the password for your account " +
                        user.email +
                        "has just been changed.\n"
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash("success", "Success! Your password has been changed.");
                    console.log(err);
                    done(err);
                });
            }
        ],
        function (err) {
            console.log(err);
            res.redirect("/");
        }
    );
});

module.exports = router;