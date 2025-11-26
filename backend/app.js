require("dotenv").config();

const express = require("express");
const path = require("path")
const cors = require("cors");
const port = process.env.PORT;
const app = express();

// Solve CORS   
app.use(cors({
  origin: "*"
}));

// Parse JSON antes das rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connection
require("./config/db.js");

const router = require("./routes/Router.js");
app.use("/api", router);

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`)
});
