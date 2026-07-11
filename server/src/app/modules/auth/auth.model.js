const mongoose = require("mongoose");

const { USER_ROLE } = require("./auth.constant");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: 0,
        },

        role: {
            type: String,
            enum: Object.values(USER_ROLE),
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        notificationPreferences: {
            criticalAlerts: { type: Boolean, default: true },
            dailySummary: { type: Boolean, default: true },
            aiSuggestions: { type: Boolean, default: true },
        },

        lastLogin: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);