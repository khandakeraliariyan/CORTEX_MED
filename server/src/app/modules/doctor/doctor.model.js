const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        specialty: {
            type: String,
            required: true,
        },

        department: {
            type: String,
            required: true,
        },

        roomNumber: {
            type: String,
            required: true,
        },

        consultationFee: {
            type: Number,
            default: 0,
        },

        averageConsultationTime: {
            type: Number,
            default: 15,
        },

        workingDays: [
            {
                type: String,
            },
        ],

        startTime: String,

        endTime: String,

        status: {
            type: String,
            enum: [
                "available",
                "busy",
                "offline",
            ],
            default: "available",
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