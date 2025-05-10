const mongoose = require("mongoose");
const initData = require("./data.js");
const Questions = require("./question.js");

const MONGO_URL = "mongodb+srv://prash:prash%4011@cluster0.p4iok.mongodb.net/myDatabase?retryWrites=true&w=majority";

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
  //await Questions.deleteMany({subject : "ETI"});
  // await Questions.insertMany(initData.data);
  await Questions.updateMany({ subject: "ETI" },{ $set: { subject: "Emerging Trends(Computer)" } });
  console.log("data was Updated");
};

initDB();
