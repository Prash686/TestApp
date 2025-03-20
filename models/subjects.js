const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    title: String,
    image: String,
    course: String,
    discription: { type: String, } // Added description field for consistency
});


module.exports = mongoose.model('Subject', subjectSchema);
