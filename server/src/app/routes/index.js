const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.route");
const doctorRoutes = require("../modules/doctor/doctor.route");
const appointmentRoutes = require("../modules/appointment/appointment.route");
const triageRoutes = require("../modules/triage/triage.route");

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/triage", triageRoutes);
router.use("/queue", queueRoutes);

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Qura API v1",
    });
});

module.exports = router;