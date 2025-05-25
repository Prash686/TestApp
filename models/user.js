const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: { type: String, required: true },  // this will be managed by the plugin
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    progress: [
        {
            subject: String,
            score: { type: Number, default: 0},
            outof : { type: Number, default: 70},
            date: { type: Date, default: Date.now },
        }
    ],
    timeSpent: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose);  // this adds username, hash, salt, and auth methods

module.exports = mongoose.model('User', userSchema);
