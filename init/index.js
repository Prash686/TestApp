const mongoose = require("mongoose");
const initData = require("./data.js");
const Questions = require("./question.js");
//const Subjects = require("./subjects")
//const Users = require("./user.js");

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
  //await Users.deleteMany({});
  await Questions.insertMany(initData.data);
  // const subjects = await Questions.distinct("subject");
  // console.log(subjects);
  //await Questions.updateMany({ subject: "ETI" },{ $set: { subject: "Emerging Trends(Computer)" } });
  //await Users.find({});
  //console.log( await Users.find({}));
  console.log("Data inserted Successfully")
};

initDB();
