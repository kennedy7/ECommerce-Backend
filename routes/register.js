const express = require("express");
const { RegisterController } = require("../controllers/registerController");
const router = express.Router();

router.post("/register", RegisterController);
