const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema({

    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        unique: true
    },

    priority: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    confidence: {
        type: Number,
        min: 0,
        max: 1
    },

    model: {
        type: String,
        default: "llama-3.1"
    },

    latency: {
        type: Number
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Triage",
    triageSchema
);