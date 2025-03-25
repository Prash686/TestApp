const express = require('express');
const router = express.Router();
const Subject = require('../models/subjects');
const Question = require('../models/question');

// Route to add a new subject
router.post('/subjects', async (req, res) => {
    try {
        const { title, description, image, questions } = req.body;
        const newSubject = new Subject({ title, description, image });
        await newSubject.save();

        // Save questions associated with the new subject
        if (questions && questions.length > 0) {
            for (let questionData of questions) {
                const newQuestion = new Question({
                    subject: title,
                    question: questionData.question,
                    option1: questionData.option1,
                    option2: questionData.option2,
                    option1: questionData.option3,
                    option1: questionData.option4,
                    Answer: questionData.Answer
                });
                await newQuestion.save();
            }
        }

        res.redirect('/subjects'); // Redirect to the subjects page or wherever appropriate
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/subjects/new', (req, res) => {
    res.render('testapp/subjectNew.ejs'); // Render the form for adding a new subject
});
