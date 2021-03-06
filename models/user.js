var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');


var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    address: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);