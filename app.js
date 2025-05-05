if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const userRoutes = require('./routes/user'); // Import user routes

const app = express();
const Questions = require("./models/question.js");
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
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"), {
    maxAge: '30d',
    etag: false
}));
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

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please Login");
        return res.redirect("/auth/login");
    }
    next();
};

// Routes
app.get("/", isLoggedIn, async (req, res) => {
    res.render("testapp/home.ejs", {
        title: "MSBTE MCQ Practice - ETI, Management, EST, AJP MCQs",
        description: "Practice and test your knowledge with MCQs for ETI, Management, EST, AJP and other subjects. Improve your skills with interactive tests on msbtemcq.in.",
        keywords: "mcq, mcqs, ETI, Management, EST, AJP, practice tests, online tests, msbte"
    });
});


app.get("/courses", isLoggedIn, async (req, res) => {
    const allCourses = await courses.find({});
    res.render("testapp/courses.ejs", {
        allCourses,
        title: "Courses - MSBTE MCQ Practice",
        description: "Explore various courses and their MCQs including ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "mcq, mcqs, courses, ETI, Management, EST, AJP, practice, msbte"
    });
});


app.get('/ads.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'ads.txt'));
});

app.get("/auth/signup", (req, res) => {
    res.render("auth/signup.ejs", {
        title: "Sign Up - MSBTE MCQ Practice",
        description: "Create an account to access MCQ practice tests for ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "signup, register, mcq, practice, msbte"
    });
});

// Handle Signup
app.post("/auth/signup", async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        const user = new User({ username, email, password, phone});

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
    res.render("auth/login.ejs", {
        title: "Login - MSBTE MCQ Practice",
        description: "Login to access your account and practice MCQs for ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "login, mcq, practice, msbte"
    });
});

app.post("/auth/login", passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect("/");
});


// Handle Logout
app.get("/auth/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out!");
        res.redirect("/");
    });
});


app.get("/practice/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const allquestions = await Questions.find({ subject: id });
    const subject = await subjects.findOne({ title: id });
    
    if (allquestions.length === 0) {
        return res.status(404).send("No Questions found for this subject");
    }

    const subjectName = subject ? subject.title : id;

    res.render("testapp/practice.ejs", {
        allquestions,
        title: `MSBTE MCQ Test for ${subjectName} - Practice & Learn`,
        description: `Free MSBTE MCQs for ${subjectName}. Practice online tests, get instant results, and improve your marks.`,
        keywords: `mcq, mcqs, ${subjectName}, practice, msbte`
    });
});

app.get("/test/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const examquestions = await Questions.find({ subject: id });
    const max = examquestions.length;
    const count = parseInt(req.query.count) || 70;
    if (max < 70) {
        return res.status(400).send("Not enough Questions to generate the test.");
    }
    
    const allquestions = [];
    const selectedIndexes = new Set();
    const subject = await subjects.findOne({ title: id });
    const subjectName = subject ? subject.title : id;
    
    while (allquestions.length < count) {
        let randomInteger = Math.floor(Math.random() * max);
        if (!selectedIndexes.has(randomInteger)) {
            allquestions.push(examquestions[randomInteger]);
            selectedIndexes.add(randomInteger);
        }
    }
    res.render("testapp/test.ejs", {
        allquestions,
        title: `MSBTE MCQ Test for ${subjectName} - Practice & Learn`,
        description: `Free MSBTE MCQs for ${subjectName}. Practice online tests, get instant results, and improve your marks.`,
        keywords: `mcq, mcqs, ${subjectName}, test, msbte`
    });
});

app.get("/subjects", isLoggedIn, async (req, res) => {
    const allSubjects = await subjects.find({});
    res.render("testapp/subjects.ejs", {
        allSubjects,
        title: "Subjects - MSBTE MCQ Practice",
        description: "Explore all subjects for MCQ practice including ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "mcq, mcqs, subjects, ETI, Management, EST, AJP, practice, msbte"
    });
});

app.get("/subjects/new", async (req, res) => {
    res.render("testapp/subjectNew.ejs", {
        title: "Add New Subject - MSBTE MCQ Practice",
        description: "Add a new subject to practice MCQs for ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "add subject, new subject, mcq, practice, msbte"
    });
});

app.post('/subjects', isLoggedIn, async (req, res) => {
    try {
        const { title, description, image, questions } = req.body;
        const newSubject = new subjects({ title, description, image });
        await newSubject.save();

        // Save questions associated with the new subject
        if (questions && questions.length > 0) {
            for (let questionData of questions) {
                const newQuestion = new Questions({
                    subject: title,
                    question: questionData.question,
                    option1: questionData.option1, // Corrected
                    option2: questionData.option2, // Corrected
                    option3: questionData.option3, // Corrected
                    option4: questionData.option4, // Corrected
                    Answer: questionData.Answer
                });
                await newQuestion.save();
            }
        }

        res.redirect('/subjects'); // Redirect to the subjects page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/courses/:id", isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const allSubjects = await subjects.find({ course: id });
        res.render("testapp/subjects.ejs", { allSubjects });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching subjects");
    }
});

app.get("/TestApp/:id", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const allSubjects = await subjects.find({});
    res.render("testapp/testOrPractice.ejs", {
        allSubjects,
        id,
        title: `Test or Practice - MSBTE MCQ - ${id}`,
        description: `Choose to test or practice MCQs for ${id} on msbtemcq.in.`,
        keywords: `mcq, mcqs, test, practice, ${id}, msbte`
    });
});

app.get("/subjects/:id", isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        res.render("testapp/cards.ejs", {
            id,
            title: `Subject Cards - MSBTE MCQ - ${id}`,
            description: `Explore MCQs and tests for subject ${id} on msbtemcq.in.`,
            keywords: `mcq, mcqs, subject, ${id}, msbte`
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching subjects");
    }
});

app.get('/new', isLoggedIn, (req, res) => {
    res.render('testapp/new.ejs', {
        title: "New MCQ - MSBTE MCQ Practice",
        description: "Add new MCQs for ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "new mcq, add mcq, practice, msbte"
    });
});

app.post("/questions", isLoggedIn, async (req, res) => {
    const que = req.body;
    const newQuestion = new Questions(que);
    
    try {
        await newQuestion.save();
        res.send("Form received and question saved!");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the question: " + err.message);
    }
});

// Catch-all route for undefined routes
app.all('*', isLoggedIn, (req, res, next) => {
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