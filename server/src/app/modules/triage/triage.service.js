const axios = require("axios");

const Appointment = require("../appointment/appointment.model");
const AppError = require("../../errors/AppError");

const runTriage = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new AppError(404, "Appointment not found");
    }

    let result;

    try {
        const response = await axios.post(
            "http://localhost:8000/triage",
            {
                symptoms: appointment.symptoms,
            },
            { timeout: 4000 }
        );

        result = response.data;
    } catch {
        // AI triage service unavailable - fall back to a neutral priority
        // so booking never blocks on the external model being offline.
        result = {
            priority: 3,
            reason: "AI triage unavailable - assigned default priority.",
            confidence: null,
        };
    }

    appointment.priority = result.priority;
    appointment.triageReason = result.reason;
    appointment.triageConfidence = result.confidence;

    await appointment.save();

    return appointment;
};

module.exports = {
    runTriage,
};