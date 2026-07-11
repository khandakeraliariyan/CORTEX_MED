const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");

const validateRequest = require("../../middlewares/validateRequest");

const { triageValidation } = require("./triage.validation");

const TriageController = require("./triage.controller");

router.post("/", auth("admin", "receptionist"), validateRequest(triageValidation), TriageController.runTriage);

router.get("/engine-status", auth("admin"), TriageController.getEngineStatus);

module.exports = router;