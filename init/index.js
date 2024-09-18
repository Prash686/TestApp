const mongoose = require("mongoose");
const initData = require("./data.js");
const question = require("./question.js");

const MONGO_URL = "mongodb+srv://pravin686:prash%4011@cluster0.yilx5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
  await question.deleteMany({});
  await question.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
