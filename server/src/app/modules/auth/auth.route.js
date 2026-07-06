const express = require("express");

const router = express.Router();

const AuthController = require("./auth.controller");

const validateRequest = require("../../middlewares/validateRequest");

const { registerValidation } = require("./auth.validation");
const { loginValidation } = require("./auth.validation");

router.post("/register", validateRequest(registerValidation), AuthController.register);

router.post("/login", validateRequest(loginValidation), AuthController.login);

module.exports = router;