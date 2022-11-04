const express = require("express")
const notes = require("./data/notes")
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")
const path = require("path")
const cors = require('cors')



const app = express();
dotenv.config();
connectDB();
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.get("/", (req,res) => {
  res.send("App is running")
})

app.get("/api/notes", (req, res) => {
  res.json(notes);
})
app.use("/api/users", userRoutes)

//-------------------------------Deployment-----------------------------------------------

// __dirname = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use()
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..")
//   })
// }

//-------------------------------Deployment----------------------------------------------


const PORT = process.env.PORT ||  4000;
app.listen(PORT, console.log(`Sever started on port ${PORT}`))