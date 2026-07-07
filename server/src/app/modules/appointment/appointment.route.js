const express = require("express");

const router = express.Router();

const AppointmentController = require("./appointment.controller");

const validateRequest = require("../../middlewares/validateRequest");

const auth = require("../../middlewares/auth");

const { createAppointmentValidation, } = require("./appointment.validation");

router.post("/", auth("admin", "receptionist"), validateRequest(createAppointmentValidation), AppointmentController.createAppointment);

module.exports = router;