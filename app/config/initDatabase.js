const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const url = process.env.MONGODB_URI.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
  );
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