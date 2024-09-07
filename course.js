const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title : {type: String, },
    discription : { type: String, },
    image : { type: String, set: (v) => v === null ? null : v},
});

const courses = mongoose.model('courses', courseSchema);

module.exports = courses;