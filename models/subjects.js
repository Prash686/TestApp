const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    title: String,
    image: String,
    course: String
});

module.exports = mongoose.model('Subject', subjectSchema);
