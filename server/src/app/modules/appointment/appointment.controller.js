const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");

const AppointmentService = require("./appointment.service");
const Doctor = require("../doctor/doctor.model");
const AppError = require("../../errors/AppError");

const createAppointment = catchAsync(async (req, res) => {
    const payload = { ...req.body };

    if (req.user?.role === "doctor") {
        const doctorProfile = await Doctor.findOne({ user: req.user.id }).select("_id");

        if (!doctorProfile) {
            throw new AppError(404, "Doctor profile not found");
        }

        payload.doctor = doctorProfile._id;
    }

    const result =
        await AppointmentService.createAppointment(
            payload
        );

    sendResponse(res, {
        statusCode: 201,
        message: "Appointment booked successfully",
        data: result,
    });
});

const listAppointments = catchAsync(async (req, res) => {
    let doctorId = req.query.doctor;

    if (req.user?.role === "doctor") {
        const doctorProfile = await Doctor.findOne({ user: req.user.id }).select("_id");

        if (!doctorProfile) {
            throw new AppError(404, "Doctor profile not found");
        }

        doctorId = doctorProfile._id;
    }

    const result = await AppointmentService.listAppointments(doctorId);

    sendResponse(res, {
        statusCode: 200,
        message: "Appointments fetched successfully",
        data: result,
    });
});

const trackAppointment = catchAsync(async (req, res) => {
    const result = await AppointmentService.trackAppointment(
        req.params.code
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Appointment fetched successfully",
        data: result,
    });
});

module.exports = {
    createAppointment,
    listAppointments,
    trackAppointment,
};
