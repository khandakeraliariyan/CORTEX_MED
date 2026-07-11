const mongoose = require("mongoose");

const hospitalSettingsSchema = new mongoose.Schema(
    {
        hospitalName: {
            type: String,
            default: "CortexMed Hospital",
            trim: true,
        },

        facilityId: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HospitalSettings", hospitalSettingsSchema);
