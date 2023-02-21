const express = require("express");
const { RegisterUser, LoginUser } = require("../controllers/authController");
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
