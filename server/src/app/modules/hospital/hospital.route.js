const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");
const validateRequest = require("../../middlewares/validateRequest");

const HospitalController = require("./hospital.controller");

const { updateHospitalSettingsValidation } = require("./hospital.validation");

router.get("/", auth("admin", "receptionist", "doctor"), HospitalController.getSettings);

router.patch("/", auth("admin"), validateRequest(updateHospitalSettingsValidation), HospitalController.updateSettings);

module.exports = router;
