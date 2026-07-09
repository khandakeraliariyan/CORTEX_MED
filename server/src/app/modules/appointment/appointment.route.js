const express = require("express");

const router = express.Router();

const AppointmentController = require("./appointment.controller");

const validateRequest = require("../../middlewares/validateRequest");

const auth = require("../../middlewares/auth");

const { createAppointmentValidation, } = require("./appointment.validation");

router.get("/", auth("admin", "receptionist"), AppointmentController.listAppointments);

router.get("/track/:code", AppointmentController.trackAppointment);

router.post("/", auth("admin", "receptionist", "doctor"), validateRequest(createAppointmentValidation), AppointmentController.createAppointment);

module.exports = router;
