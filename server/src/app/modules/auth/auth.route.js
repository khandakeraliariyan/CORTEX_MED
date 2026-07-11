const express = require("express");

const router = express.Router();

const AuthController = require("./auth.controller");

const validateRequest = require("../../middlewares/validateRequest");
const auth = require("../../middlewares/auth");

const { registerValidation, loginValidation, refreshValidation, changePasswordValidation } = require("./auth.validation");

router.post("/register", validateRequest(registerValidation), AuthController.register);

router.post("/login", validateRequest(loginValidation), AuthController.login);

router.post("/refresh", validateRequest(refreshValidation), AuthController.refresh);

router.patch("/change-password", auth(), validateRequest(changePasswordValidation), AuthController.changePassword);

router.get("/me", auth(), AuthController.me);

module.exports = router;