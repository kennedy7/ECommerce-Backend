const User = require("../models/user");
const { auth, isAdmin, isUser } = require("../middlewares/auth");
const usersRouter = require("express").Router();
const moment = require("moment");
const {
  getAllUsers,
  deleteUser,
  getUser,
} = require("../controllers/authController");

//get users Stats for the month compare to last month
usersRouter.get("/api/users/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  try {
    const users = await User.aggregate([
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
    res.status(200).send(users);
    // console.log(users);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
//get all users route
usersRouter.get("/api/users", isAdmin, getAllUsers);
usersRouter.get("/api/users/:id", isUser, getUser);

//delete a user by id
usersRouter.delete("/api/users/:id", isAdmin, deleteUser);

module.exports = usersRouter;
