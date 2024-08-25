const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const qes = require("./question.js");
const path = require("path")

const Mongo = "mongodb://127.0.0.1:27017/TestApp";


main().then(() => {
    console.log("connected");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo);
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get("/", (req,res) => {
    res.send("hi");
});

app.get('/your-route', (req, res) => {
    res.render('new'); // This will look for 'new.ejs' in the views directory
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


// const express = require('express');
// const path = require('path');
// const app = express();

// // Set the views directory
// app.set('views', path.join(__dirname, 'views'));

// // Set the view engine to EJS
// app.set('view engine', 'ejs');

// // Define a route
// app.get('/your-route', (req, res) => {
//     res.render('new'); // This will look for 'new.ejs' in the views directory
// });

// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
