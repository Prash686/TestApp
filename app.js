const express = require('express');
const app = express();
const mongoose = require("mongoose");
const questions = require("./question.js");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const path = require("path");

const Mongo = "mongodb://127.0.0.1:27017/TestApp";
main().then(() => {
    console.log("connected");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo);
}
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.get("/", (req, res) => {
    res.send("hi");
});

app.get("/questions", async (req, res) => {
    const allquestions = await questions.find({});
    res.render("./index.ejs", { allquestions });
});

app.get('/new', (req, res) => {
    res.render('new');
});

// app.post("/questions", async (req, res) => {
//     const  newquestion = new questions (req.body.question);
//     await newquestion.save();
//     // let  newquestion = req.body.questions;
//     console.log(newquestion);
//     res.send("Form received!");
// });

app.post("/questions", async (req, res) => {
    // Create a new question document with the data from the request body
    const que = req.body;
    const newQuestion = new questions(que);
    console.log(newQuestion);
    try {
        await newQuestion.save();
        res.send("Form received and question saved!");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the question: " + err.message);
    }
});

// app.get("/testqes", async (req, res) => {
//     let sampleqes = new qes({
//         q : "how much percentage water is present on earth.",
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
    console.log("success");
});
