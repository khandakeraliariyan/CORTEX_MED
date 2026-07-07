const axios = require("axios");

const Appointment = require("../appointment/appointment.model");

const Triage = require("./triage.model");

const AppError = require("../../errors/AppError");

const runTriage = async (id) => {

    const appointment = await Appointment.findById(id);

    if (!appointment) {

        throw new AppError(
            404,
            "Appointment not found"
        );

    }

    const response = await axios.post("http://localhost:8000/triage",
        {

            symptoms:
                appointment.symptoms

        }
    );

    const result = response.data;

    return await Triage.create({

        appointment: id,

        priority: result.priority,

        reason: result.reason,

        confidence: result.confidence

    });

};

module.exports = {
    runTriage
};