const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: String,
    description: String
});

module.exports = mongoose.model('Course', courseSchema);
