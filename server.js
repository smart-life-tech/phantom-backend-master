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



const PORT = process.env.PORT ;

app.listen(PORT, console.log(`Sever started on port ${PORT}`))