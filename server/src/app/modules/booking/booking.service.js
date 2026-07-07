const AppointmentService = require("../appointment/appointment.service");
const TriageService = require("../triage/triage.service");
const WaitTimeService = require("../wait-time/waitTime.service");

const bookPatient = async (payload) => {
    const appointment = await AppointmentService.createAppointment(payload);

    const updatedAppointment = await TriageService.runTriage(
        appointment._id
    );

    await WaitTimeService.recalculateQueue(
        updatedAppointment.doctor
    );

    return updatedAppointment;
};

module.exports = {
    bookPatient,
};