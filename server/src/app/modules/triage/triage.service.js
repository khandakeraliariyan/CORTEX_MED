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
            risk: "Medium",
            department: "General Medicine",
            summary: "AI unavailable. Default priority assigned.",
        };
    }

    appointment.priority = result.priority;
    appointment.triageReason = result.reason;
    appointment.triageConfidence = result.confidence;
    appointment.triageFactors = Array.isArray(result.factors) ? result.factors : [];
    appointment.riskLevel = result.risk ?? null;
    appointment.recommendedDepartment = result.department ?? null;
    appointment.aiSummary = result.summary ?? null;

    await appointment.save();

    return appointment;
};

module.exports = {
    runTriage,
};