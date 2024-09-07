const mongoose = require("mongoose");
const initData = require("./data.js");
const courses = require("./course.js");

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
  await courses.deleteMany({});
  await courses.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
