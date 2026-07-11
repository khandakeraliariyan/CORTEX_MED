const Appointment = require("./appointment.model");
const Doctor = require("../doctor/doctor.model");

const AppError = require("../../errors/AppError");

const generateAppointmentCode = require("../../utils/generateAppointmentCode");
const generateTokenNumber = require("../../utils/generateTokenNumber");

const TriageService = require("../triage/triage.service");
const WaitTimeService = require("../wait-time/waitTime.service");

const NotificationService = require("../notification/notification.service");

const createAppointment = async (payload) => {
    // Check doctor exists
    const doctor = await Doctor.findById(payload.doctor);

    if (!doctor) {
        throw new AppError(404, "Doctor not found");
    }

    // Generate appointment code
    payload.appointmentCode = generateAppointmentCode();

    // Generate token number
    payload.tokenNumber = await generateTokenNumber(
        payload.doctor
    );

    // Create appointment
    const appointment = await Appointment.create(payload);

    // Run AI Triage
    const updatedAppointment =
        await TriageService.runTriage(
            appointment._id
        );

    // Update everyone's wait time
    await WaitTimeService.recalculateQueue(
        appointment.doctor
    );

    NotificationService.queueUpdated(
        appointment.doctor
    );

    NotificationService.waitUpdated(
        appointment.doctor
    );

    return updatedAppointment;
};

const listAppointments = async (doctorId) => {
    const filter = doctorId ? { doctor: doctorId } : {};

    return await Appointment.find(filter)
        .sort({ createdAt: -1 })
        .populate({
            path: "doctor",
            populate: { path: "user", select: "name email" },
        });
};

const trackAppointment = async (code) => {
    const appointment = await Appointment.findOne({
        appointmentCode: code,
    }).populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
    });

    if (!appointment) {
        throw new AppError(404, "Appointment not found");
    }

    let peopleAhead = 0;

    if (appointment.status === "waiting") {
        peopleAhead = await Appointment.countDocuments({
            doctor: appointment.doctor._id,
            status: "waiting",
            $or: [
                { priority: { $lt: appointment.priority } },
                {
                    priority: appointment.priority,
                    tokenNumber: { $lt: appointment.tokenNumber },
                },
            ],
        });
    }

    return { appointment, peopleAhead };
};

module.exports = {
    createAppointment,
    listAppointments,
    trackAppointment,
};