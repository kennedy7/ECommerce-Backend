const Order = require("../models/order");
const { isAdmin } = require("../middlewares/auth");
const ordersStatsRouter = require("express").Router();
const moment = require("moment");

//GET MONTHLY ORDERS STATS
ordersStatsRouter.get("/api/orders/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const orders = await Order.aggregate([
      // {
      //   //starting from previous month i.e >=
      //   $match: { createdAt: { $gte: new Date(previousMonth) } },
      // },
      // {
      //   $project: {
      //     month: { $month: "$createdAt" },
      //   },
      // },
      // {
      //   $group: {
      //     _id: "$month",
      //     total: { $sum: 1 },
      //   },
      {
        //starting from previous month i.e >=
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          time: {
            $concat: [
              { $substr: [{ $year: "$createdAt" }, 0, 4] },
              " - ",
              { $substr: [{ $month: "$createdAt" }, 0, 2] },
            ],
          },
        },
      },

      {
        $group: {
          _id: "$time",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//GET MONTHLY INCOME STATS
ordersStatsRouter.get("/api/orders/income/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const income = await Order.aggregate([
      // {
      //   //starting from previous month i.e >=
      //   $match: { createdAt: { $gte: new Date(previousMonth) } },
      // },
      // {
      //   $project: {
      //     month: { $month: "$createdAt" },
      //     sales: "$total",
      //   },
      // },
      // {
      //   $group: {
      //     _id: "$month",
      //     total: { $sum: "$sales" },
      //   },
      {
        //starting from previous month i.e >=
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          time: {
            $concat: [
              { $substr: [{ $year: "$createdAt" }, 0, 4] },
              " - ",
              { $substr: [{ $month: "$createdAt" }, 0, 2] },
            ],
          },
          sales: "$total",
        },
      },

      {
        $group: {
          _id: "$time",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).send(income);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//GET A WEEK SALES [chart]
ordersStatsRouter.get("/api/orders/week-sales", isAdmin, async (req, res) => {
  const last7Days = moment()
    .day(moment().day() - 7)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const income = await Order.aggregate([
      {
        //starting from last 7 days i.e >=
        $match: { createdAt: { $gte: new Date(last7Days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).send(income);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//GET ORDERS/ RECENT TRANSACTIONs
ordersStatsRouter.get("/api/orders/", isAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const orders = query
      ? await Order.find().sort({ _id: -1 }).limit(5)
      : await Order.find().sort({ _id: -1 });
    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
module.exports = ordersStatsRouter;
