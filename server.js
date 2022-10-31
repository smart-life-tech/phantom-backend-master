const express = require("express")

const notes = require("./data/notes")







const app = express();


app.get("/", (req, res) => {
  res.send("App is running")
})

app.get("/api/notes", (req, res) => {
  res.json(notes)
})




const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`Sever started on port ${PORT}`))