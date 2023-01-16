const express = require("express");
const { LoginUser } = require("../controllers/LoginController");
const { RegisterUser } = require("../controllers/registerController");
const validatorMiddleware = require("../middlewares/validatormiddleware");
const AuthValidator = require("../validators/authValidators");
const router = express.Router();

router.post(
  "/api/register",
  validatorMiddleware(AuthValidator.Registerschema, "body"),
  RegisterUser
);
router.post(
  "/api/login",
  validatorMiddleware(AuthValidator.Loginschema, "body"),
  LoginUser
);

module.exports = router;
