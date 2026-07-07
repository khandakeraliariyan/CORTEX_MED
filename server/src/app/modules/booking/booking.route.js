const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");

const validateRequest = require("../../middlewares/validateRequest");

const { createAppointmentValidation } = require("../appointment/appointment.validation");

const BookingController = require("./booking.controller");

router.post("/", auth("admin", "receptionist"), validateRequest(createAppointmentValidation), BookingController.createBooking);

module.exports = router;