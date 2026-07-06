const Appointment = require("./appointment.model");

const Doctor = require("../doctor/doctor.model");

const AppError = require("../../errors/AppError");

const generateAppointmentCode = require("../../utils/generateAppointmentCode");

const generateTokenNumber = require("../../utils/generateTokenNumber");

const createAppointment = async (payload) => {

    const doctor =
        await Doctor.findById(payload.doctor);

    if (!doctor) {
        throw new AppError(
            404,
            "Doctor not found"
        );
    }

    payload.appointmentCode =
        generateAppointmentCode();

    payload.tokenNumber =
        await generateTokenNumber(
            payload.doctor
        );

    const appointment =
        await Appointment.create(payload);

    return appointment;
};

module.exports = {
    createAppointment,
};