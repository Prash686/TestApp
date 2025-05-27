if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Additional required imports
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const express = require("express");


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
app.use(express.json());  // Add this middleware to parse JSON request bodies
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"), {
    maxAge: '30d',
    etag: false
}));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // Determine if the username is email, phone, or username
        let loginField = "username";
        if (/\S+@\S+\.\S+/.test(username)) {
            loginField = "email";
        } else if (/^\d{10}$/.test(username)) {
            loginField = "phone";
        }

        // Find user by loginField
        const user = await User.findOne({ [loginField]: username });
        if (!user) {
            return done(null, false, { message: "Incorrect username/email/phone." });
        }

        // Verify password
        const isValid = await user.authenticate(password);
        if (!isValid) {
            return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
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
        req.flash("error", "Please Signup");
        return res.redirect("/auth/signup");
    }
    next();
};

// Routes
// app.get("/", async (req, res) => {
//     res.render("testapp/home.ejs", {
//         title: "MSBTE MCQ Practice - ETI, Management, EST, AJP MCQs",
//         description: "Practice and test your knowledge with MCQs for ETI, Management, EST, AJP and other subjects. Improve your skills with interactive tests on msbtemcq.in.",
//         keywords: "mcq, mcqs, ETI, Management, EST, AJP, practice tests, online tests, msbte"
//     });
// });

app.get('/', async (req, res, ) => {
    // Fetch featured subjects (example: limit to 6)
    const allSubjects = await subjects.find({}).limit(6).exec();

    // Fetch top users by timeSpent descending, limit 10
    const topUsers = await User.find({})
        .sort({ timeSpent: -1 })
        .limit(10)
        .select('username timeSpent')
        .exec();

    // Render home page with subjects and top users data
    res.render('testapp/home', {
        allSubjects,
        topUsers,
        title: "MSBTE MCQ Practice - ETI, Management, EST, AJP MCQs",
        description: "Practice and test your knowledge with MCQs for ETI, Management, EST, AJP and other subjects. Improve your skills with interactive tests on msbtemcq.in.",
        keywords: "mcq, mcqs, ETI, Management, EST, AJP, practice tests, online tests, msbte"
    });
});

// GET route to render forgot password form
app.get('/auth/forgot-password', (req, res) => {
    res.render('auth/forgot-password.ejs', {
        title: "Forgot Password - MSBTE MCQ Practice",
        description: "Reset your password for MSBTE MCQ Practice",
        keywords: "forgot password, reset password, msbte"
    });
});

// POST route to handle forgot password form submission
app.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/auth/forgot-password');
        }

        // Generate reset token
        const token = crypto.randomBytes(20).toString('hex');
        // console.log("Generated reset token:", token);

        // Set token and expiration on user
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();
        //console.log("Saved user with reset token and expiration:", user.resetPasswordToken, user.resetPasswordExpires);

        // Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "gsa115376@gmail.com",
                pass: "rbnc ynms jssn cloq"
            }
        });

        const resetUrl = `http://${req.headers.host}/auth/reset-password/${token}`;
        //console.log("Password reset URL:", resetUrl);

        const mailOptions = {
            to: user.email,
            from: process.env.GMAIL_USER,
            subject: 'MSBTE MCQ Practice Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        res.redirect('/auth/forgot-password');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error sending the password reset email. Please try again later.');
        res.redirect('/auth/forgot-password');
    }
});

// GET route to render reset password form
app.get('/auth/reset-password/:token', async (req, res) => {
    try {
        console.log("Received reset token in URL:", req.params.token);
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log("User found for reset token:", user);

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password.ejs', {
            token: req.params.token,
            title: "Reset Password - MSBTE MCQ Practice",
            description: "Reset your password for MSBTE MCQ Practice",
            keywords: "reset password, msbte"
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error processing your request.');
        res.redirect('/auth/forgot-password');
    }
});

// POST route to handle reset password form submission
app.post('/auth/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect(`/auth/reset-password/${req.params.token}`);
        }

        // Set new password using passport-local-mongoose's setPassword
        await user.setPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        req.flash('success', 'Your password has been updated. You can now log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error resetting your password. Please try again.');
        res.redirect('/auth/forgot-password');
    }
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
        description: "access MCQ practice tests for ETI, Management, EST, AJP and more on msbtemcq.in.",
        keywords: "signup, register, mcq, practice, msbte"
    });
});

// Handle Signup
app.post("/auth/signup", async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Validate username format (Instagram-like: letters, numbers, and underscores)
        const usernamePattern = /^[a-z0-9_]+$/;
        if (!usernamePattern.test(username)) {
            req.flash("error", "Username can only contain letters, numbers, and underscores.");
            return res.redirect("/auth/signup");
        }

        const user = new User({ username, email, password, phone });

        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to msbtemcq!");
            res.redirect("/");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/auth/signup");
    }
});
// Route to render the login page
app.get("/auth/login", (req, res) => {
    res.render("auth/login.ejs", {
        title: "Login - MSBTE MCQ Practice",
        description: "Practice MCQs for ETI, Management, EST, AJP, and more on msbtemcq.in.",
        keywords: "login, mcq, practice, msbte"
    });
});

// Login route with custom logic for username/phone/email
app.post("/auth/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Determine if the input is an email or phone number or username
        let loginField = "username";
        let loginValue = username;

        // Check if the username is in the email format
        if (/\S+@\S+\.\S+/.test(username)) {
            loginField = "email";
            loginValue = username;
        }
        // Check if the username is a phone number (basic check)
        else if (/^\d{10}$/.test(username)) {
            loginField = "phone";
            loginValue = username;
        }

        // Find user by the login field (username, email, or phone)
        const user = await User.findOne({ [loginField]: loginValue });

        if (!user) {
            req.flash("error", "No account found with that username/email/phone.");
            return res.redirect("/auth/login");
        }

        // Authenticate user using passport-local strategy
        passport.authenticate("local", {
            failureRedirect: "/auth/login",
            failureFlash: true
        })(req, res, () => {
            req.flash("success", "Welcome back!");
            res.redirect("/");  // Redirect to homepage or dashboard after successful login
        });

    } catch (err) {
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/auth/login");
    }
});

// Callback after successful login
app.post("/auth/login", (req, res) => {
    req.flash("success", "Welcome back!");
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


app.get("/practice/:id",  isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const allquestions = await Questions.find({ subject: id });
    const subject = await subjects.findOne({ title: id });
    
    if (allquestions.length === 0) {
        return res.status(404).send("No Questions found for this subject");
    }

    const subjectName = subject ? subject.title : id;

    res.render("testapp/practice.ejs", {
        allquestions,
        subjectName,
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

app.get("/subjects/new", isLoggedIn, async (req, res) => {
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

// Route to render user profile page
app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('username email phone progress timeSpent');
        res.render('testapp/profile', { currentUser: user, progress: user.progress });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load profile');
        res.redirect('/');
    }
});

// API route to get user progress data
app.get('/api/user/progress', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('progress');
        res.json({ progress: user.progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user progress' });
    }
});

// API route to update user progress data after test/practice completion
app.post('/api/user/progress', isLoggedIn, async (req, res) => {
    try {
        const { subject, score, outof, details } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Find existing progress for the subject
        const existingProgress = user.progress.find(p => p.subject === subject);
        if (existingProgress) {
            // Update only if new score is higher
            if (score > existingProgress.score) {
                existingProgress.score = score;
                existingProgress.outof = outof;
                existingProgress.date = new Date();
                if (details) {
                    existingProgress.details = details;
                }
            }
        } else {
            // Add new progress entry
            user.progress.push({ subject, score, outof, date: new Date(), details });
        }
        await user.save();
        res.json({ message: 'Progress updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user progress' });
    }
});

app.get('/Contact', (req, res) => {
    res.render('testapp/contact', {
        title: "MSBTEMCQ.IN Feedback",
        description: "Contact MSBTE MCQ feedback, or support.",
        keywords: "contact, support, feedback, msbte"
    });
});

// POST route to handle forgot password form submission
app.post('/Contact', async (req, res) => {
    const {name , email, message} = req.body;

    try {
        // Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "gsa115376@gmail.com",
                pass: "rbnc ynms jssn cloq"
            }
        });

        const mailOptions = {
            to: "gsa115376@gmail.com",
            from: email,
            subject: name+"'s Massege/Feedback From msbtemcq.in.",
            text: message,
        };

        await transporter.sendMail(mailOptions);

        req.flash('success', `An Message has been sent to Developer`);
        res.redirect('/Contact');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error sending the Message. Please try again later.');
        res.redirect('/Contact');
    }
});

app.post('/user/timeSpent', isLoggedIn, async (req, res) => {
    try {
        const { timeSpent } = req.body;
        if (!timeSpent || isNaN(timeSpent)) {
            return res.status(400).json({ error: 'Invalid timeSpent value' });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.timeSpent = (user.timeSpent || 0) + Number(timeSpent);
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({ message: 'Time spent updated successfully' });
    } catch (err) {
        console.error('Error updating time spent:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const users = await User.find({})
            .sort({ timeSpent: -1 })
            .skip(skip)
            .limit(limit)
            .select('username timeSpent')
            .exec();

        res.json(users);
    } catch (err) {
        console.error('Error fetching leaderboard users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/leaderBoard', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ timeSpent: -1 })
            .limit(10)
            .select('username timeSpent')
            .exec();

        res.render('testapp/leaderBoard', {
            topUsers,
            title: "Leaderboard - MSBTE MCQ Practice",
            description: "Top users by time spent practicing MCQs on msbtemcq.in.",
            keywords: "leaderboard, top users, time spent, msbte"
        });
    } catch (err) {
        console.error('Error fetching leaderboard users:', err);
        res.status(500).send('Internal server error');
    }
});

// Privacy Policy page
app.get('/privacy', (req, res) => {
    res.render('testapp/privacy', {
        title: "Privacy Policy - MSBTE MCQ Practice",
        description: "Read the privacy policy for MSBTE MCQ Practice website.",
        keywords: "privacy policy, data protection, msbte"
    });
});

// Terms of Service page
app.get('/terms', (req, res) => {
    res.render('testapp/terms', {
        title: "Terms of Service - MSBTE MCQ Practice",
        description: "Read the terms of service for MSBTE MCQ Practice website.",
        keywords: "terms of service, terms, msbte"
    });
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
