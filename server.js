const express = require("express")
const notes = require("./data/notes")
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")
const subRoutes = require("./routes/subRoutes")
const path = require("path")
const cors = require('cors')

const app = express();
dotenv.config();
connectDB();
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors({
    origin: '*',
    // origin: function (origin, callback) {
    //   if (whitelist.indexOf(origin) !== -1) {
    //     callback(null, true)
    //   } else {
    //     callback(new Error('Not allowed by CORS'))
    //   }
    // },
    methods:['GET','PUT','POST','DELETE'],
    credentials: true
}
))



app.get("/", (req,res) => {
  res.send("App is running")
})

app.get("/api/notes", (req, res) => {
  res.json(notes);
})
app.use("/api/users", userRoutes)
// app.use("/api/sub", subRoutes)

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


const PORT = process.env.PORT ||  5000;
let Server =app.listen(PORT, console.log(`Sever started on port ${PORT}`))


let io = (require("socket.io"))(Server, {
  cors: {
    origin: '*',
  }
})

app.use("/api/users", userRoutes)
app.use("/api/sub", subRoutes(io))