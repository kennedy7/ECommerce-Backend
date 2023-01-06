const express = require("express");
const { RegisterUser } = require("../controllers/registerController");
const router = express.Router();

router.post("/api/register", RegisterUser);

module.exports = router;
