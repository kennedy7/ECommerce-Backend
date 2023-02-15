const Order = require("../models/order");
const { isAdmin } = require("../middlewares/auth");
const ordersStatsRouter = require("express").Router();
const moment = require("moment");
const {
  getMonthlyOrdersStats,
  getMonthlyIncomeStats,
  getOneWeekSales,
  getRecentOrders,
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
ordersStatsRouter.get("/api/orders/week-sales", isAdmin, getOneWeekSales);

//GET ORDERS/ RECENT TRANSACTIONs
ordersStatsRouter.get("/api/orders/", isAdmin, getRecentOrders);
module.exports = ordersStatsRouter;
