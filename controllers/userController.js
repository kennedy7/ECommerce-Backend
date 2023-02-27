const User = require("../models/user");

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //specifying to avoid sending the password
    res.status(200).send({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

//update user
exports.updateUser = async (req, res) => {
  const { name, email, isAdmin, password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    //email change check
    if (!(user.email === email)) {
      const emailInUse = await User.findOne({ email: email });
      if (emailInUse) return res.status(400).send("email is already in use");
    }

    if (password && user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        email: email,
        isAdmin: isAdmin,
        password: user.password,
      },
      { new: true }
    );
    res.status(200).send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//delete user by id
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).send(deletedUser);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getUsersMonthlyStats = async (req, res) => {
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
};
