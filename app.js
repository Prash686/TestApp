require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const questions = require('./init/question.js');
const subjects = require('./init/subjects.js');
const courses = require('./init/course.js');
const ExpressError = require('./util/ExpressError.js');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const path = require('path');

// MongoDB connection string from environment variables
const Mongo = "mongodb+srv://prash:prash%4011@cluster0.p4iok.mongodb.net/myDatabase?retryWrites=true&w=majority";
console.log(Mongo);
async function main() {
    try {
        await mongoose.connect(Mongo);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

main();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

// Routes
app.get("/", async (req, res) => {
    res.render("testapp/home.ejs");
});

app.get('/ads.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'ads.txt'));
});

app.get("/practice/:id", async (req, res) => {
    let { id } = req.params;
    const allquestions = await questions.find({ subject: id });
    
    if (allquestions.length === 0) {
        return res.status(404).send("No questions found for this subject");
    }

    res.render("testapp/practice.ejs", { allquestions });
});

app.get("/test/:id", async (req, res) => {
    let { id } = req.params;
    const examquestions = await questions.find({ subject: id });
    const max = examquestions.length;
    const count = parseInt(req.query.count) || 70;
    if (max < 70) {
        return res.status(400).send("Not enough questions to generate the test.");
    }
    
    const allquestions = [];
    const selectedIndexes = new Set();
    
    while (allquestions.length < count) {
        let randomInteger = Math.floor(Math.random() * max);
        if (!selectedIndexes.has(randomInteger)) {
            allquestions.push(examquestions[randomInteger]);
            selectedIndexes.add(randomInteger);
        }
    }
    console.log(allquestions.length);
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

// Catch-all route for undefined routes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("testapp/error.ejs", { message });
});

// Start the server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
