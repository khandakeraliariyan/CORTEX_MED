const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true,
        },

        symptoms: {
            type: String,
            required: true,
        },

        priority: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        reason: {
            type: String,
            required: true,
        },

        confidence: {
            type: Number,
            default: 0,
        },

        model: {
            type: String,
            default: "llama3.1",
        },

        latency: Number,

        isReviewed: {
            type: Boolean,
            default: false,
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Triage",
    triageSchema
);