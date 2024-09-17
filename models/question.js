const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    subject: String,
    question: String,
    option1: String,
    option2: String,
    option3: String,
    option4: String,
    Answer: String,
    marks: Number,
    topic: String
});

module.exports = mongoose.model('Question', questionSchema);
