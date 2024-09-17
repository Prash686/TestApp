const express = require('express');
const app = express();
const mongoose = require("mongoose");
const questions = require("./init/question.js");
const subjects = require("./init/subjects.js");
const courses = require("./init/course.js");
const ExpressError = require('./util/ExpressError.js');
const flash = require("connect-flash");
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.get("/", async (req, res) => {
    res.render("testapp/home.ejs");
});

app.get("/practice/:id", async (req, res) => {
    let { id } = req.params;
    const allquestions = await questions.find({subject: id});
    res.render("testapp/practice.ejs", { allquestions });
});

app.get("/test/:id", async (req, res) => {
    let { id } = req.params;
    const examquestions = await questions.find({subject: id});
    let max = examquestions.length;
    const allquestions = [];
    for (i = 0; i < 20; i++) {
        let randomInteger = Math.floor(Math.random() * max);
        allquestions.push(examquestions[randomInteger]);
    }
    res.render("testapp/test.ejs", { allquestions });
});

app.get("/subjects", async (req, res) => {
    const allSubjects = await subjects.find({});
    res.render("testapp/subjects.ejs", { allSubjects });
});

app.get("/courses", async (req, res) => {
    const allCourses = await courses.find({});
    res.render("testapp/courses.ejs", { allCourses });
});

app.get("/courses/:id", async (req, res) => {
    try {
        let { id } = req.params;
        const allSubjects = await subjects.find({ course: id });
        res.render("testapp/subjects.ejs", { allSubjects });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching subjects");
    }
});

app.get("/TestApp/:id", async (req, res) => {
    let { id } = req.params;
    const allSubjects = await subjects.find({});
    res.render("testapp/testOrPractice.ejs", { allSubjects, id });
});

app.get("/subjects/:id", async (req, res) => {
    try {
        let { id } = req.params;
        res.render("testapp/cards.ejs", { id });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching subjects");
    }
});

app.get('/new', (req, res) => {
    res.render('testapp/new.ejs');
});

app.post("/questions", async (req, res) => {
    const que = req.body;
    const newQuestion = new questions(que);
    try {
        await newQuestion.save();
        res.send("Form received and question saved!");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the question: " + err.message);
    }
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("testapp/error.ejs", { message });
});

app.listen(8080, () => {
    console.log("success");
});
