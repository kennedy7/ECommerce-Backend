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
  deleteOrder,
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
ordersStatsRouter.get('/api/my-orders/:id', isUser, getUserOrders);
//update An Order
ordersStatsRouter.patch("/api/orders/:id", auth, UpdateOrder);
//Get An Order
ordersStatsRouter.get("/api/orders/findOne/:id", auth, getOrder);
//delete an order
ordersStatsRouter.delete("/api/orders/:id", isAdmin, deleteOrder);

module.exports = ordersStatsRouter;
