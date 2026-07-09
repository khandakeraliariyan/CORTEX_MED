const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");

const QueueController = require("./queue.controller");

router.get("/:doctorId", auth("admin", "doctor", "receptionist"), QueueController.getQueue);

router.patch("/call-next/:doctorId", auth("doctor", "receptionist"), QueueController.callNextPatient);

router.patch("/complete/:appointmentId", auth("doctor", "receptionist"), QueueController.completePatient);

module.exports = router;
