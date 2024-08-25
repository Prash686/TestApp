const mongoose = require("mongoose");
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

const initDB = async () => {
    await qes.deleteMany({});
    console.log("sample was deleted");
}

initDB();