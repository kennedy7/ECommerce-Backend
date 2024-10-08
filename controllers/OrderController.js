const Order = require("../models/order");
const moment = require("moment");

//GET MONTHLY ORDERS STATS
exports.getMonthlyOrdersStats = async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const orders = await Order.aggregate([
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
};

//GET MONTHLY INCOME STATS
exports.getMonthlyIncomeStats = async (req, res) => {
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
};

//GET A WEEK SALES [chart]
exports.getOneWeekSales = async (req, res) => {
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
};

//GET ORDERS/ RECENT TRANSACTIONs
exports.getRecentOrders = async (req, res) => {
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
};

// Update Order
exports.UpdateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Check if the logged-in user is either an admin or the owner of the order
    if (req.user.isAdmin || order.userId.toString() === req.user._id.toString()) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      return res.status(200).send(updatedOrder);
    } else {
      // If the user is not authorized
      return res.status(403).send("You are not authorized to update this order");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};


//Get An Order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (req.user._id !== order.userId || !req.user.isAdmin) {
      return res.status(403).send("Access Denied, Not Authorized!");
    }
    res.status(200).send(order);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    // Find all orders that belong to the currently logged-in user
    const orders = await Order.find({ userId: req.user._id });

    // If no orders are found
    if (!orders || orders.length === 0) {
      return res.status(404).send("No orders found for this user.");
    }

    // Return the user's orders
    res.status(200).send(orders);
  } catch (err) {
    res.status(500).send("Something went wrong. Please try again.");
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    await order.remove();
    res.status(200).send({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).send(err);
  }
};
