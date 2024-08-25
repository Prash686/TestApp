const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const qes = require("./question.js");

const Mongo = "mongodb://127.0.0.1:27017/TestApp";

main().then(() => {
    console.log("connected");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo);
}

app.get("/", (req,res) => {
    res.send("hi");
});

// app.get("/testqes", async (req, res) => {
//     let sampleqes = new qes({
//         q : "how much percentage water is prasent on earth.",
//         op1 : "71%",
//         op2 : "29%",
//         op3 : "72%",
//         op4 : "28%",
//         ans : "71%",
//     });

//     await sampleqes.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });



app.listen(8080, () => {
    console.log("sucess");
});