const axios = require("axios");

const Appointment = require("../appointment/appointment.model");
const AppError = require("../../errors/AppError");

const config = require("../../config");

const runTriage = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new AppError(404, "Appointment not found");
    }

    let result;

    try {
        const response = await axios.post(
            config.ai_service_url,
            {
                symptoms: appointment.symptoms,
            },
            { timeout: 20000 }
        );

        result = response.data;
    } catch {
        // AI triage service unavailable - fall back to a neutral priority
        // so booking never blocks on the external model being offline.
        result = {
            priority: 3,
            reason: "AI unavailable. Default priority assigned.",
            confidence: 0,
            factors: [],
        };
    }

    appointment.priority = result.priority;
    appointment.triageReason = result.reason;
    appointment.triageConfidence = result.confidence;
    appointment.triageFactors = Array.isArray(result.factors) ? result.factors : [];

    await appointment.save();

    return appointment;
};

module.exports = {
    runTriage,
};