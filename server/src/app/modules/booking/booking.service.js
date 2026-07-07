const AppointmentService = require("../appointment/appointment.service");

const TriageService = require("../triage/triage.service");

const QueueService = require("../queue/queue.service");

const bookPatient = async (payload) => {

    const appointment = await AppointmentService.createAppointment(payload);

    const triage = await TriageService.runTriage(
        appointment._id
    );

    const queue = await QueueService.insertPatient(
        appointment,
        triage
    );

    return {

        appointment,

        triage,

        queue

    };

};

module.exports = {

    bookPatient

};