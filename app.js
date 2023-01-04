const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const products = require("./products");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the backend homepage");
});
app.get("/products", (req, res) => {
  res.send(products);
});
app.listen(PORT, () => {
  console.log(`Ecommerce backend running on port ${PORT} `);
});

const url = process.env.DB_URL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("database connected successfully"));
