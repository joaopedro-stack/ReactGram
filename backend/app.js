require("dotenv").config()

const express = require("express");
const path = require("path")
const cors = require("cors");
const port = process.env.PORT;
const app = express();

// config JSON and form data response
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Solve CORS   
app.use(cors({
  origin: "*"
}));

//Upload directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// DB connection
require("./config/db.js");
// routes
const router = require("./routes/Router.js")

app.use("/api/users", router)

app.listen(port, () => {
    console.log(`Spp rodando na porta ${port}`)
})