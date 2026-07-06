const express = require("express");

const router = express.Router();

const AuthController = require("./auth.controller");

const validateRequest = require("../../middlewares/validateRequest");

const { registerValidation } = require("./auth.validation");

router.post("/register", validateRequest(registerValidation), AuthController.register);

module.exports = router;