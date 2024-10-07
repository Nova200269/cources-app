const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const url = "mongodb+srv://bilalrizk:VrTmGxAzRhz22KWj@cluster0.bgyad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  // const url = process.env.MONGODB_URI;
  // const url = "mongodb://127.0.0.1:27017/instituteDB"
  mongoose
    .connect(url)
    .then(() => console.log("DB connection went successful!"))
    .catch((e) => console.error(e));
  const { connection: db } = mongoose;
  db.once("open", () => console.log("Connected to mongodb"));
  db.once("disconnected", () => console.log("Disconnected from mongodb"));
  db.on("error", (err) => console.log(`Error connecting to mongodb `, err));
};

module.exports = connectDB;