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
            trim: true,
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },

        symptoms: {
            type: String,
            required: true,
            trim: true,
        },

        appointmentCode: {
            type: String,
            unique: true,
            required: true,
        },

        tokenNumber: {
            type: Number,
            required: true,
        },

        priority: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },

        triageReason: {
            type: String,
            default: null,
        },

        triageConfidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        },

        triageFactors: {
            type: [String],
            default: [],
        },

        aiModel: {
            type: String,
            default: null,
        },

        triagedAt: {
            type: Date,
            default: null,
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

        calledAt: {
            type: Date,
            default: null,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            default: "",
        },

        priority: {
            type: Number,
            default: 5,
        },

        triageReason: {
            type: String,
            default: null,
        },

        triageConfidence: {
            type: Number,
            default: null,
        },

        estimatedWait: {
            type: Number,
            default: 0,
        },

        calledAt: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },
        
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);