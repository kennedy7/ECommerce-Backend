const Order = require("../models/order");
const { isAdmin } = require("../middlewares/auth");
const ordersStatsRouter = require("express").Router();
const moment = require("moment");
const {
  getMonthlyOrdersStats,
  getMonthlyIncomesStats,
} = require("../controllers/OrderController");

//GET MONTHLY ORDERS STATS
ordersStatsRouter.get("/api/orders/stats", isAdmin, getMonthlyOrdersStats);

//GET MONTHLY INCOME STATS
ordersStatsRouter.get(
  "/api/orders/income/stats",
  isAdmin,
  getMonthlyIncomeStats
);

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
