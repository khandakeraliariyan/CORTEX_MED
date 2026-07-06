const mongoose = require("mongoose");

const { APPOINTMENT_STATUS } = require("./appointment.constant");

const appointmentSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            required: true,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },

        symptoms: {
            type: String,
            required: true,
        },

        appointmentCode: {
            type: String,
            unique: true,
        },

        tokenNumber: {
            type: Number,
            required: true,
        },

        priority: {
            type: Number,
            default: 5,
        },

        estimatedWait: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: Object.values(APPOINTMENT_STATUS),
            default: APPOINTMENT_STATUS.WAITING,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);