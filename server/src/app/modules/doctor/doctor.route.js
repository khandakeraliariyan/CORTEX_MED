const express = require("express");

const router = express.Router();

const DoctorController = require("./doctor.controller");

const validateRequest = require("../../middlewares/validateRequest");

const auth = require("../../middlewares/auth");

const { createDoctorValidation, } = require("./doctor.validation");

router.post("/", auth("admin"), validateRequest(createDoctorValidation), DoctorController.createDoctor);

module.exports = router;