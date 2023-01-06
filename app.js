const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const router = require("./routes/AuthRoute");
const ProductRouter = require("./routes/productRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(router);
app.use(ProductRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the backend homepage");
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
  .then(() => console.log("database connected successfully"))
  .catch((err) => console.log(`connection to database failed`, err.message));
