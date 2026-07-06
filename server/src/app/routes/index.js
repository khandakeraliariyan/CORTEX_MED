const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.route");
const doctorRoutes = require("../modules/doctor/doctor.route");

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Qura API v1",
    });
});

module.exports = router;