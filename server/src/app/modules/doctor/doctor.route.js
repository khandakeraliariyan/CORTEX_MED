const express = require("express");

const router = express.Router();

const DoctorController = require("./doctor.controller");

const validateRequest = require("../../middlewares/validateRequest");

const auth = require("../../middlewares/auth");

const { createDoctorValidation, updateDoctorValidation, } = require("./doctor.validation");

router.get("/", auth("admin", "receptionist", "doctor"), DoctorController.listDoctors);

router.post("/", auth("admin"), validateRequest(createDoctorValidation), DoctorController.createDoctor);

router.patch("/:id", auth("admin"), validateRequest(updateDoctorValidation), DoctorController.updateDoctor);

router.delete("/:id", auth("admin"), DoctorController.deleteDoctor);

module.exports = router;