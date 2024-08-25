const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionsSchema = new Schema({
    subject : {
        type: String,
    },
    q : {
        type: String,
        required: true,
    },
    op1 :{
        type: String,
        required: true,
    },
    op2 : {
        type: String,
        required: true,
    },
    op3 : {
        type: String,
    },
    op4 : {
        type: String,
    },
    ans :{
        type: String,
        required: true,
    },
    marks : {
        type: Number,
        default:
      1,
    set: (v) =>
      v === null
        ? 1
        : v,
    },
    topic : {
        type: Number,
    },
});

const qes = mongoose.model("qes", questionsSchema);
module.exports = qes;