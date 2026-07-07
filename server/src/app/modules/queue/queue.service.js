const Appointment = require("../appointment/appointment.model");
const Doctor = require("../doctor/doctor.model");
const AppError = require("../../errors/AppError");

const getDoctorQueue = async (doctorId) => {
    const queue = await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    })
        .sort({
            priority: 1,
            tokenNumber: 1,
        })
        .populate("doctor");

    return queue;
};

const callNextPatient = async (doctorId) => {
    const nextPatient = await Appointment.findOne({
        doctor: doctorId,
        status: "waiting",
    }).sort({
        priority: 1,
        tokenNumber: 1,
    });

    if (!nextPatient) {
        throw new AppError(404, "No patient in queue");
    }

    nextPatient.status = "serving";
    nextPatient.calledAt = new Date();

    await nextPatient.save();

    return nextPatient;
};

const completePatient = async (appointmentId) => {
    const patient = await Appointment.findById(appointmentId);

    if (!patient) {
        throw new AppError(404, "Appointment not found");
    }

    patient.status = "completed";
    patient.completedAt = new Date();

    await patient.save();

    return patient;
};

const estimateWait = async (doctorId, appointmentId) => {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new AppError(404, "Doctor not found");
    }

    const queue = await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    }).sort({
        priority: 1,
        tokenNumber: 1,
    });

    const index = queue.findIndex((patient) =>
        patient._id.equals(appointmentId)
    );

    if (index === -1) {
        return 0;
    }

    return index * doctor.avgConsultationTime;
};

module.exports = {
    getDoctorQueue,
    callNextPatient,
    completePatient,
    estimateWait,
};