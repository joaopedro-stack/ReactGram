require("dotenv").config()

const express = require("express");
const path = require("path")
const cors = require("cors");
const port = process.env.PORT;
const app = express();

// Solve CORS   
app.use(cors({
  origin: "*"
}));

// DB connection
require("./config/db.js");

const router = require("./routes/Router.js");
app.use("/api", router);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Spp rodando na porta ${port}`)
});
