const express = require("express");
const { RegisterUser, LoginUser, ForgotPassword, ResetPassword } = require("../controllers/authController");
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

router.post(
  '/api/forgot-password',
  validatorMiddleware(AuthValidator.ForgotPasswordSchema, 'body'),
  ForgotPassword
);

router.post(
  '/api/reset-password',
  validatorMiddleware(AuthValidator.ResetPasswordSchema, 'body'),
  ResetPassword
);

module.exports = router;
