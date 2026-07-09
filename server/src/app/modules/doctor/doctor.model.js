const mongoose = require("mongoose");

const { DOCTOR_STATUS } = require("./doctor.constant");

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        department: {
            type: String,
            required: true,
            default: "General Medicine",
            trim: true,
        },

        specialty: {
            type: String,
            required: true,
            default: "General Practitioner",
            trim: true,
        },

        room: {
            type: String,
            required: true,
            default: "Unassigned",
            trim: true,
        },

        consultationFee: {
            type: Number,
            default: 0,
        },

        avgConsultationTime: {
            type: Number,
            default: 15,
        },

        workingDays: [
            {
                type: String,
            },
        ],

        startTime: {
            type: String,
            required: true,
            default: "09:00",
        },

        endTime: {
            type: String,
            required: true,
            default: "17:00",
        },

        status: {
            type: String,
            enum: Object.values(DOCTOR_STATUS),
            default: DOCTOR_STATUS.AVAILABLE,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Doctor",
    doctorSchema
);
