const mongoose = require("mongoose");
const initData = require("./data.js");
const questions = require("./question.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/TestApp";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  // await questions.deleteMany({});
  await questions.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
