const { User } = require("../models/user");
const { auth, isAdmin, isUser } = require("../middlewares/auth");
const userStatsRouter = require("express").Router();
const moment = require("moment");

userStatsRouter.get("/api/users/stat", async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const users = User.aggregate([
      {
        //starting from previous month i.e >=
        $match: { createdAt: { gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = userStatsRouter;
