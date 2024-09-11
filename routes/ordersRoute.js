const { isAdmin, auth, isUser } = require("../middlewares/auth");
const ordersStatsRouter = require("express").Router();

const {
  getMonthlyOrdersStats,
  getMonthlyIncomeStats,
  getOneWeekSales,
  getRecentOrders,
  UpdateOrder,
  getOrder,
  getUserOrders,
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
// get the logged-in user's orders
ordersStatsRouter.get('/my-orders/:id', isUser, getUserOrders);
//update An Order
ordersStatsRouter.patch("/api/orders/:id", isAdmin, UpdateOrder);
//Get An Order
ordersStatsRouter.get("/api/orders/findOne/:id", auth, getOrder);

module.exports = ordersStatsRouter;
