const axios = require("axios");

const Triage = require("./triage.model");

const Appointment = require("../appointment/appointment.model");

const AppError = require("../../errors/AppError");

const runTriage = async (appointmentId) => {

    const appointment =
        await Appointment.findById(
            appointmentId
        );

    if (!appointment) {
        throw new AppError(
            404,
            "Appointment not found"
        );
    }

    const response =
        await axios.post(
            process.env.AI_URL + "/triage",
            {
                symptoms:
                    appointment.symptoms
            }
        );

    const triage =
        await Triage.create({

            appointment: appointment._id,

            symptoms: appointment.symptoms,

            priority:
                response.data.priority,

            reason:
                response.data.reason,

            confidence:
                response.data.confidence,

            latency:
                response.data.latency

        });

    return triage;

};

module.exports = {
    runTriage
}