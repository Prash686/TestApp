if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const questions = require("./models/question.js");
const subjects = require("./models/subjects.js");
const courses = require("./models/course.js");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError.js')
const User = require("./models/user.js");
const routes = require("./routes/auth.js")


const dbUrl = "mongodb+srv://prash:prash%4011@cluster0.p4iok.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose.connect(dbUrl)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

const sessionOptions = {
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.get("/", async (req, res) => {
    res.render("testapp/home.ejs");
});

app.get('/ads.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'ads.txt'));
});

app.get("/auth/signup", (req, res) => {
    res.render("auth/signup.ejs");
});

// Handle Signup
app.post("/auth/signup", async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        const user = new User({ username, email, phone});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to TestApp!");
            res.redirect("/");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/auth/signup");
    }
});

// Render Login Page
app.get("/auth/login", (req, res) => {
    res.render("auth/login.ejs");
});

app.post("/auth/login", passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect("/");

});

// Handle Logout
app.get("/auths/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out!");
        res.redirect("/");
    });
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
