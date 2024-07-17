const express = require("express");
const { RegisterUser, LoginUser, ForgotPassword, ResetPassword } = require("../controllers/authController");

const AuthValidator = require("../validators/authValidators");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
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

router.post(
  '/api/forgot-password',
  validatorMiddleware(AuthValidator.ForgotPasswordSchema, 'body'),
  ForgotPassword
);

router.post(
  '/api/reset-password/:token',
  validatorMiddleware(AuthValidator.ResetPasswordSchema, 'body'),
  ResetPassword
);

module.exports = router;
