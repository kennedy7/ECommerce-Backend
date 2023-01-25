const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const router = require("./routes/AuthRoute");
const ProductRouter = require("./routes/productRoute");
const StripeRouter = require("./routes/stripe");
const userStatsRouter = require("./routes/users");
const ordersStatsRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(router);
app.use(ProductRouter);
app.use(StripeRouter);
app.use(userStatsRouter);
app.use(ordersStatsRouter);

app.listen(PORT, () => {
  console.log(`Ecommerce Backend Server running on port ${PORT} `);
});

const url = process.env.DB_URL;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected successfully!"))
  .catch((err) => console.log(`Connection to database failed`, err.message));
