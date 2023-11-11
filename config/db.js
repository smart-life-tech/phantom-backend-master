const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = "mongodb://username:password@host:port/database";
    console.log(process.env.MONGO_URI);
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
    // const conn = await mongoose.connect(process.env.MONGO_URI, {
    //   useUnifiedTopology: true,
    //   useNewUrlParser: true,
    //   // useCreateIndex: true,
    // }

    // )
    // console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
