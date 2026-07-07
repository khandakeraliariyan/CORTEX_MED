const Appointment = require("../appointment/appointment.model");
const Doctor = require("../doctor/doctor.model");

const AppError = require("../../errors/AppError");

const WaitTimeService = require("../wait-time/waitTime.service");

/**
 * Get Doctor Queue
 */
const getDoctorQueue = async (doctorId) => {
    return await Appointment.find({
        doctor: doctorId,
        status: "waiting",
    })
        .sort({
            priority: 1,
            tokenNumber: 1,
        })
        .populate("doctor");
};

/**
 * Call Next Patient
 */
const callNextPatient = async (doctorId) => {
    const nextPatient =
        await Appointment.findOne({
            doctor: doctorId,
            status: "waiting",
        }).sort({
            priority: 1,
            tokenNumber: 1,
        });

    if (!nextPatient) {
        throw new AppError(
            404,
            "No patient found in queue"
        );
    }

    nextPatient.status = "serving";
    nextPatient.calledAt = new Date();

    await nextPatient.save();

    // Update everyone else's waiting time
    await WaitTimeService.recalculateQueue(
        doctorId
    );

    return nextPatient;
};

/**
 * Complete Consultation
 */
const completePatient = async (appointmentId) => {
    const patient =
        await Appointment.findById(
            appointmentId
        );

    if (!patient) {
        throw new AppError(
            404,
            "Appointment not found"
        );
    }

    patient.status = "completed";
    patient.completedAt = new Date();

    await patient.save();

    // Update queue after completion
    await WaitTimeService.recalculateQueue(
        patient.doctor
    );

    return patient;
};

/**
 * Estimate Wait Time
 */
const estimateWait = async (
    doctorId,
    appointmentId
) => {
    const doctor =
        await Doctor.findById(doctorId);

    if (!doctor) {
        throw new AppError(
            404,
            "Doctor not found"
        );
    }

    const queue =
        await Appointment.find({
            doctor: doctorId,
            status: "waiting",
        }).sort({
            priority: 1,
            tokenNumber: 1,
        });

    const index = queue.findIndex((item) =>
        item._id.equals(appointmentId)
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