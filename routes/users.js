const userStatsRouter = require("express").Router();

userStatsRouter.get("/stat", async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH-mm-ss");

  res.send(previousMonth);
});

module.exports = userStatsRouter;
