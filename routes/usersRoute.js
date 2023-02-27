const { auth, isAdmin, isUser } = require("../middlewares/auth");
const usersRouter = require("express").Router();
const {
  getMonthlyUsersStats,
  getAllUsers,
  deleteUser,
  getUser,
  updateUser,
} = require("../controllers/userController");

//get users Stats for the month compare to last month
usersRouter.get("/api/users/stats", isAdmin, getMonthlyUsersStats);

//get all users
usersRouter.get("/api/users", isAdmin, getAllUsers);

//get user by id
usersRouter.get("/api/users/find/:id", isUser, getUser);

//updateUser
usersRouter.patch("/api/users/:id", isUser, updateUser);

//delete a user by id
usersRouter.delete("/api/users/:id", isAdmin, deleteUser);

module.exports = usersRouter;
