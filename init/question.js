const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    subject : {type: String, default: "ETC"},
    question: { type: String, },
    option1: { type: String, },
    option2: { type: String,  },
    option3: { type: String }, // Assuming this is optional
    option4: { type: String }, // Assuming this is optional
    Answer: { type: String,  },
    marks : {type: Number, default: 1, set: (v) => v === null ? 1: v,},
    topic : {type: Number,default: 1},
});

const questions = mongoose.model('questions', questionSchema);

module.exports = questions;