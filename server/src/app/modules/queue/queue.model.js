const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },

    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        unique: true
    },

    priority: {
        type: Number,
        required: true
    },

    tokenNumber: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "waiting",
            "serving",
            "completed"
        ],
        default: "waiting"
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "Queue",
        queueSchema
    );