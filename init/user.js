const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    progress: [
        {
            subject: String,
            score: Number,
            totalQuestions: Number,
            date: { type: Date, default: Date.now },
            details: [
                {
                    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
                    correct: Boolean
                }
            ]
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);

