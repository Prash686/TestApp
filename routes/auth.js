const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// Render Signup Page
router.get("/signup", (req, res) => {
    res.render("auth/signup.ejs");
});

// Handle Signup
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
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
router.get("/login", (req, res) => {
    res.render("auth/login.ejs");
});

// Handle Login
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect("/");
});

// Handle Logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out!");
        res.redirect("/");
    });
});

module.exports = router;
