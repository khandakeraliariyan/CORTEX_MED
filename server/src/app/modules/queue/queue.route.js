const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");

const QueueController = require("./queue.controller");

router.get("/:doctorId", auth("doctor", "receptionist", "admin"), QueueController.getQueue);

module.exports = router;