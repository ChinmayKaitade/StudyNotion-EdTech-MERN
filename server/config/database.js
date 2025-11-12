const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database Connected Successful");
    })
    .catch((error) => {
      console.log(`Error while connecting server with Database`);
      console.log(error);
      process.exit(1);
    });
};
