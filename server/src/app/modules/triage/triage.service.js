const axios = require("axios");

const Appointment = require("../appointment/appointment.model");
const AppError = require("../../errors/AppError");

const runTriage = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new AppError(404, "Appointment not found");
    }

    const response = await axios.post(
        "http://localhost:8000/triage",
        {
            symptoms: appointment.symptoms,
        }
    );

    const result = response.data;

    appointment.priority = result.priority;
    appointment.triageReason = result.reason;
    appointment.triageConfidence = result.confidence;

    await appointment.save();

    return appointment;
};

module.exports = {
    runTriage,
};