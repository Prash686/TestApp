const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    course : { type: String,},
    title : {type: String, },
    discription : { type: String, },
    image : { type: String,},
});

const subjects = mongoose.model('subjects', subjectSchema);

module.exports = subjects;