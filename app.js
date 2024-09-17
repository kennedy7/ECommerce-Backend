const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const router = require("./routes/AuthRoute");
const ProductRouter = require("./routes/productRoute");
const CategoryRouter = require("./routes/categoryRoute");
const StripeRouter = require("./routes/stripe");
const usersRouter = require("./routes/usersRoute");
const ordersStatsRouter = require("./routes/ordersRoute");
const contactRouter = require("./routes/contactRouter");
const PaystackRouter = require("./routes/paystack");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.json({ limit: '100mb' }));  
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const corsOptions = {
  origin: '*', 
  // origin: 'https://www.powermartelectricals.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  exposedHeaders: 'Content-Length,X-Content-Type-Options', 
  credentials: true,
  preflightContinue: false, 
  optionsSuccessStatus: 204 
};

app.use(cors(corsOptions));


//Routes
app.use(router);
app.use(contactRouter);
app.use(ProductRouter);
app.use(CategoryRouter);
app.use(StripeRouter);
app.use(usersRouter);
app.use(ordersStatsRouter);
app.use(PaystackRouter)

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
