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
            trim: true,
        },

        specialty: {
            type: String,
            required: true,
            trim: true,
        },

        room: {
            type: String,
            required: true,
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
        },

        endTime: {
            type: String,
            required: true,
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